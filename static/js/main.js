let selectedFolderId = null;
let updateFolderId = null;
let updateUrlId = null;
let urlList = null;

document.addEventListener("DOMContentLoaded", function () {
    
    // folder data 세팅
    const folderLinks = document.querySelectorAll(".folder-name");
    const selectFolder = document.getElementById("selectFolder");
    const createFolderButton = document.getElementById("createFolder");
    const updateFolderButton = document.getElementById("updateFolder");
    const submitForderButton = document.getElementById("submitFolderButton");
    const folderModal = new bootstrap.Modal(document.getElementById("folderModal"));
    
    // 초기화면 url list 세팅
    if (folderLinks.length > 0) {
        selectedFolderId = folderLinks[0].dataset.folderId;
        loadUrlsForFolder(selectedFolderId);
    }

    // 폴더 클릭하면 해당 폴더 안에 url list 세팅
    folderLinks.forEach(link => {
        link.addEventListener("click", function (event) {
            event.preventDefault();
            selectedFolderId = this.dataset.folderId;
            selectFolder.textContent = this.getAttribute("data-folder-name");
            loadUrlsForFolder(selectedFolderId);
        });
    });

    // 폴더 생성 버튼 클릭
    createFolderButton.addEventListener("click", function () {
        folderModal.show();
        
        document.getElementById("folderNameInput").value = '';
    });

    // 폴더 수정 버튼 클릭
    updateFolderButton.addEventListener("click", function () {
        folderModal.show();
        document.getElementById("folderNameInput").value = selectFolder.textContent;
        document.getElementById("folderModalLabel").textContent = "폴더 수정";
        submitForderButton.textContent = "수정";
    });

    // 폴더 모달에서 submit 버튼 (수정일시)
    submitForderButton.addEventListener("click", function (event) {
        if (submitForderButton.textContent !== "수정") return;
        event.preventDefault();
        updateFolder();
    });

    // url data
    // const updateUrlButton = document.getElementById("updateUrl");
    const addUrlButton = document.getElementById("addUrlButton");
    const urlModal = new bootstrap.Modal(document.getElementById("urlModal"));

    // url 생성 버튼 클릭
    if (addUrlButton) {
        addUrlButton.addEventListener("click", function () {
            if (!selectedFolderId) return alert("폴더를 먼저 생성해주세요.");
            document.getElementById("urlModalDropdown").style.visibility = "hidden";
            urlModal.show();
            document.getElementById("urlInput").value = '';
            document.getElementById("aliasInput").value = '';
        });
    }

    // 드롭다운 항목 클릭 시 폴더 이름을 버튼에 반영하고 폴더 ID 저장
    document.querySelector('.dropdown-menu').addEventListener('click', function (event) {
        const folderItem = event.target.closest('.dropdown-item');
        if (folderItem) {
            const folderName = folderItem.getAttribute('data-folder-name');  // 폴더 이름
            updateFolderId = folderItem.getAttribute('data-folder-id');   // 폴더 ID

            // 폴더 이름을 버튼에 반영
            document.getElementById("folderDropdown").textContent = folderName;

        }
    });

});

// **************************************** folder api start ****************************************

// 폴더 수정
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

// 폴더 삭제
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

    // url의 삭제 버튼 클릭
    if (event.target.closest(".delete-url-btn")) {
        const urlId = event.target.closest(".delete-url-btn").getAttribute("data-url");
        deleteUrl(urlId); // url 삭제
    }
    
    // url 수정 버튼 클릭시 url 모달 세팅
    if(event.target.closest("#updateUrl")) {

        updateFolderId = null
        const urlDataString = event.target.closest("#updateUrl").getAttribute("data-url");
        const urlData = JSON.parse(urlDataString); // 문자열 → JSON 객체 변환
        const submitUrlButton = document.getElementById("submitUrlButton");
        const urlModal = new bootstrap.Modal(document.getElementById("urlModal"));

        updateUrlId = urlData.id
        document.getElementById("urlModalLabel").textContent = "URL 수정";
        submitUrlButton.textContent = "수정";
        submitUrlButton.onclick = updateUrl
        document.getElementById("urlModalDropdown").style.visibility = "visible";
        urlModal.show();
        document.getElementById("urlInput").value = urlData.link;
        document.getElementById("urlInput").disabled = true
        document.getElementById("aliasInput").value = urlData.description;
        document.getElementById("folderDropdown").textContent = '폴더 선택';
    }


});

// 폴더에 해당하는 url list 가져오는 함수
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

// url 저장 함수
async function saveUrl() {
    const url = document.getElementById("urlInput").value.trim();
    const alias = document.getElementById("aliasInput").value.trim();
    if (!url) return alert("URL을 입력하세요.");
    bootstrap.Modal.getInstance(document.getElementById("urlModal")).hide();

    // 즉시 UI에 "추가 중..." 표시
    const urlContainer = document.getElementById('url-list-container');
    const tempId = `temp-${Date.now()}`;
    urlContainer.innerHTML += `
        <div id="${tempId}" class="col">
            <div class="card border border-1 border-secondary rounded-3">
                <div class="card-body text-center text-muted">⏳ 추가 중...</div>
            </div>
        </div>
    `;

    // fetch()를 백그라운드에서 실행 (await 사용 X)
    fetch("/urls-api/", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRFToken": getCsrfToken() },
        body: JSON.stringify({ url, description: alias, folder_id: selectedFolderId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // 새 URL 추가 & UI 업데이트
            urlContainer.innerHTML += urlCard(data.data);
            // loadUrlsForFolder(selectedFolderId);
        } else {
            alert("오류 발생: " + data.message);
        }
    })
    .catch(error => {
        console.error("Error:", error);
        
    })
    .finally(()=>{
        document.getElementById(tempId).remove();
    });
}

// url 수정 함수
function updateUrl() {
    const modalElement = document.getElementById("urlModal");
    const aliasInput = document.getElementById("aliasInput").value;

    fetch("/urls-api/", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "X-CSRFToken": getCsrfToken() },
        body: JSON.stringify({ 
            updateUrlId: updateUrlId,
            updateFolderId: updateFolderId,
            alias: aliasInput
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadUrlsForFolder(selectedFolderId); // 목록 새로고침

            // 모달 닫기
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) {
                modalInstance.hide();
            }
        } else {
            alert("수정 실패: " + data.message);
        }
    })
    .catch(error => console.error("Error:", error));
}

// url 삭제 함수
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

// loading toggle 함수
function toggleLoading(isLoading) {
    document.getElementById("loadingSpinner").style.display = isLoading ? "block" : "none";
    document.getElementById("urlInput").disabled = isLoading;
    document.getElementById("aliasInput").disabled = isLoading;
}

// csrf 토큰 가져오는 함수
function getCsrfToken() {
    return document.querySelector('input[name="csrfmiddlewaretoken"]').value;
}

// var msnry = new Masonry('.masonry-container', {
//     itemSelector: '.masonry-item',
//     columnWidth: 200,
//     gutter: 16
// });

// url list에서 검색하는 함수
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

// url 카드 리턴 해주는 함수
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
                        <button id="updateUrl" class="btn btn-outline-primary btn-sm" data-url='${JSON.stringify(url)}'>
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


