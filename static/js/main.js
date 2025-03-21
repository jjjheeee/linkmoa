let selectedFolderId = null;
let urlList = null;

document.addEventListener("DOMContentLoaded", function () {
    
    // folder data 
    const folderLinks = document.querySelectorAll(".folder-name");
    const selectFolder = document.getElementById("selectFolder");
    const createFolderButton = document.getElementById("createFolder");
    const updateFolderButton = document.getElementById("updateFolder");
    const submitForderButton = document.getElementById("submitFolderButton");
    const folderModal = new bootstrap.Modal(document.getElementById("folderModal"));
    
    if (folderLinks.length > 0) {
        selectedFolderId = folderLinks[0].dataset.folderId;
        loadUrlsForFolder(selectedFolderId);
    }

    folderLinks.forEach(link => {
        link.addEventListener("click", function (event) {
            event.preventDefault();
            selectedFolderId = this.dataset.folderId;
            selectFolder.textContent = this.getAttribute("data-folder-name");
            loadUrlsForFolder(selectedFolderId);
        });
    });

    createFolderButton.addEventListener("click", function () {
        folderModal.show();
        document.getElementById("folderNameInput").value = '';
    });

    updateFolderButton.addEventListener("click", function () {
        folderModal.show();
        document.getElementById("folderNameInput").value = selectFolder.textContent;
        document.getElementById("folderModalLabel").textContent = "폴더 수정";
        submitForderButton.textContent = "수정";
    });

    submitForderButton.addEventListener("click", function (event) {
        if (submitForderButton.textContent !== "수정") return;
        event.preventDefault();
        updateFolder();
    });

    // url data
    // const updateUrlButton = document.getElementById("updateUrl");
    const addUrlButton = document.getElementById("addUrlButton");
    const urlModal = new bootstrap.Modal(document.getElementById("urlModal"));

    if (addUrlButton) {
        addUrlButton.addEventListener("click", function () {
            if (!selectedFolderId) return alert("폴더를 먼저 생성해주세요.");
            urlModal.show();
            document.getElementById("urlInput").value = '';
            document.getElementById("aliasInput").value = '';
        });
    }

    // updateUrlButton.addEventListener("click", function () {
    //     urlModal.show();
    //     document.getElementById("urlModalLabel").textContent = "URL 수정";
    //     submitForderButton.textContent = "수정";
    // });

});

// **************************************** folder api start ****************************************

function updateFolder() {
    const folderName = document.getElementById("folderNameInput").value.trim();
    if (!folderName) return alert("폴더 이름을 입력하세요.");
    fetch("/folder-api/", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-CSRFToken": getCsrfToken() },
        body: JSON.stringify({ folder_id: selectedFolderId, folderName })
    })
    .then(response => response.json())
    .then(data => data.success ? location.reload() : alert("수정 실패: " + data.message))
    .catch(error => console.error("Error:", error));
}

function deleteFolder() {
    if (!confirm("이 폴더를 삭제하시겠습니까?")) return;
    fetch("/folder-api/", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "X-CSRFToken": getCsrfToken() },
        body: JSON.stringify({ folder_id: selectedFolderId })
    })
    .then(response => response.json())
    .then(data => data.success ? location.href = "/" : alert(data.error))
    .catch(error => console.error("Error:", error));
}

// **************************************** folder api end ****************************************

// **************************************** url api start ****************************************

// 이벤트 위임 방식으로 클릭 이벤트 처리
document.getElementById("url-list-container").addEventListener("click", function (event) {
    // url의 삭제 버튼
    if (event.target.closest(".delete-url-btn")) {
        const urlId = event.target.closest(".delete-url-btn").getAttribute("data-url");
        deleteUrl(urlId);
    }
    
    // url 수정 버튼
    if(event.target.closest("#updateUrl")) {

        const submitUrlButton = document.getElementById("submitUrlButton");
        const urlModal = new bootstrap.Modal(document.getElementById("urlModal"));

        document.getElementById("urlModalLabel").textContent = "URL 수정";
        submitUrlButton.textContent = "수정";
        urlModal.show();
        // #############################
        // document.getElementById("urlInput").value = '';
        // document.getElementById("aliasInput").value = '';
    }


});

function loadUrlsForFolder(folderId) {
    fetch(`/urls-api/${folderId}/`)
        .then(response => response.json())
        .then(data => {
            urlList = data.urls;
            const urlContainer = document.getElementById('url-list-container');
            urlContainer.innerHTML = data.urls.length > 0 ? data.urls.map(
                url => urlCard(url)
            ).join('') : '<p>이 폴더에는 URL이 없습니다.</p>';
        })
        .catch(error => console.error('Error fetching URL data:', error));
}

// function saveUrl() {
//     const url = document.getElementById("urlInput").value.trim();
//     const alias = document.getElementById("aliasInput").value.trim();
//     if (!url) return alert("URL을 입력하세요.");
//     toggleLoading(true);
//     fetch("/urls-api/", {
//         method: "POST",
//         headers: { "Content-Type": "application/json", "X-CSRFToken": getCsrfToken() },
//         body: JSON.stringify({ url, description: alias, folder_id: selectedFolderId })
//     })
//     .then(response => response.json())
//     .then(data => {
//         if (data.success) {
//             bootstrap.Modal.getInstance(document.getElementById("urlModal")).hide();
//             loadUrlsForFolder(selectedFolderId);
//         } else alert("오류 발생: " + data.message);
//     })
//     .catch(error => console.error("Error:", error))
//     .finally(() => toggleLoading(false));
// }

async function saveUrl() {
    const url = document.getElementById("urlInput").value.trim();
    const alias = document.getElementById("aliasInput").value.trim();
    if (!url) return alert("URL을 입력하세요.");
    bootstrap.Modal.getInstance(document.getElementById("urlModal")).hide();

    // ⏳ 1. 즉시 UI에 "추가 중..." 표시
    const urlContainer = document.getElementById('url-list-container');
    const tempId = `temp-${Date.now()}`;
    urlContainer.innerHTML += `
        <div id="${tempId}" class="col">
            <div class="card border border-1 border-secondary rounded-3">
                <div class="card-body text-center text-muted">⏳ 추가 중...</div>
            </div>
        </div>
    `;

    // 🕹 2. fetch()를 백그라운드에서 실행 (await 사용 X)
    fetch("/urls-api/", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRFToken": getCsrfToken() },
        body: JSON.stringify({ url, description: alias, folder_id: selectedFolderId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // 3. ✅ 새 URL 추가 & UI 업데이트
            document.getElementById(tempId).remove();  // "추가 중..." 제거
            urlContainer.innerHTML += urlCard(data.data);
            // loadUrlsForFolder(selectedFolderId);
        } else {
            alert("오류 발생: " + data.message);
            document.getElementById(tempId).remove();
        }
    })
    .catch(error => {
        console.error("Error:", error);
        document.getElementById(tempId).remove();
    });
}

// 삭제 함수
function deleteUrl(urlId) {

    const deleteUrlCard = document.getElementById(`url_${urlId}`)

    if (!confirm("해당 URL을 삭제하시겠습니까?")) return;
    fetch("/urls-api/", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "X-CSRFToken": getCsrfToken() },
        body: JSON.stringify({ urlId: urlId })
    })
    .then(response => response.json())
    .then(data => data.success ? deleteUrlCard.remove() : alert(data.error))
    // .then(data => data.success ? loadUrlsForFolder(selectedFolderId) : alert(data.error))
    .catch(error => console.error("Error:", error));
}

// **************************************** url api end ****************************************

function toggleLoading(isLoading) {
    document.getElementById("loadingSpinner").style.display = isLoading ? "block" : "none";
    document.getElementById("urlInput").disabled = isLoading;
    document.getElementById("aliasInput").disabled = isLoading;
}

function getCsrfToken() {
    return document.querySelector('input[name="csrfmiddlewaretoken"]').value;
}

// var msnry = new Masonry('.masonry-container', {
//     itemSelector: '.masonry-item',
//     columnWidth: 200,
//     gutter: 16
// });

function searchUrls() {
    const searchName = document.getElementById("folderSearch").value;
    const urlContainer = document.getElementById('url-list-container');

    // 검색어가 포함된 URL 리스트 필터링
    const searchUrlList = urlList.filter(url => 
        url.name.toLowerCase().includes(searchName) || 
        url.description.toLowerCase().includes(searchName)
    );

    urlContainer.innerHTML = searchUrlList.length > 0 ? searchUrlList.map(
        url => urlCard(url)
    ).join('') : '<p>검색된 URL이 없습니다.</p>';
}

function urlCard(url) {
    return `
        <div id="url_${url.id}" class="col">
            <div class="card border border-1 border-dark rounded-3 rounded-bottom">
                <a href="${url.link}" class="text-decoration-none" target="_blank">
                    <img src="${url.image}" class="card-img-top" alt="사이트 썸네일">
                </a>
                <div class="card-body">
                    <h5 class="card-title">${url.name}</h5>
                    ${url.description ? `<p class="card-text">${url.description}</p>` : ""}
                    <div class="d-flex align-items-center gap-3 justify-content-end">
                        <button id="updateUrl" class="btn btn-outline-primary btn-sm">
                            <i class="fi fi-tr-pen-square"></i>
                        </button>
                        <button class="btn btn-outline-danger btn-sm delete-url-btn" data-url='${JSON.stringify(url.id)}'>
                            <i class="fi fi-rr-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
}


