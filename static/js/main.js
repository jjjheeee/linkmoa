let selectedFolderId = null;
let urlList = null;

document.addEventListener("DOMContentLoaded", function () {
    const folderLinks = document.querySelectorAll(".folder-name");
    const selectFolder = document.getElementById("selectFolder");
    const addUrlButton = document.getElementById("addUrlButton");
    const createFolderButton = document.getElementById("createFolder");
    const updateFolderButton = document.getElementById("updateFolder");
    const submitButton = document.getElementById("submitFolderButton");
    const FolderModal = new bootstrap.Modal(document.getElementById("FolderModal"));

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

    if (addUrlButton) {
        addUrlButton.addEventListener("click", function () {
            if (!selectedFolderId) return alert("폴더를 먼저 생성해주세요.");
            const UrlModal = new bootstrap.Modal(document.getElementById("urlModal"));
            UrlModal.show();
            document.getElementById("urlInput").value = '';
            document.getElementById("aliasInput").value = '';
        });
    }

    createFolderButton.addEventListener("click", function () {
        FolderModal.show();
        document.getElementById("folderNameInput").value = '';
    });

    updateFolderButton.addEventListener("click", function () {
        FolderModal.show();
        document.getElementById("FolderModalLabel").textContent = "폴더 수정";
        submitButton.textContent = "수정";
    });

    submitButton.addEventListener("click", function (event) {
        if (submitButton.textContent !== "수정") return;
        event.preventDefault();
        updateFolder();
    });
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

function saveUrl() {
    const url = document.getElementById("urlInput").value.trim();
    const alias = document.getElementById("aliasInput").value.trim();
    if (!url) return alert("URL을 입력하세요.");
    toggleLoading(true);
    fetch("/urls-api/", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-CSRFToken": getCsrfToken() },
        body: JSON.stringify({ url, description: alias, folder_id: selectedFolderId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            bootstrap.Modal.getInstance(document.getElementById("urlModal")).hide();
            loadUrlsForFolder(selectedFolderId);
        } else alert("오류 발생: " + data.message);
    })
    .catch(error => console.error("Error:", error))
    .finally(() => toggleLoading(false));
}

// 이벤트 위임 방식으로 클릭 이벤트 처리
document.addEventListener("click", function (event) {
    if (event.target.closest(".delete-url-btn")) {
        const urlId = event.target.closest(".delete-url-btn").getAttribute("data-url");
        
        deleteUrl(urlId);
    }
});

// 삭제 함수
function deleteUrl(urlId) {
    if (!confirm("해당 URL을 삭제하시겠습니까?")) return;
    fetch("/urls-api/", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "X-CSRFToken": getCsrfToken() },
        body: JSON.stringify({ urlId: urlId })
    })
    .then(response => response.json())
    .then(data => data.success ? loadUrlsForFolder(selectedFolderId) : alert(data.error))
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
        <div class="col">
            <div class="card">
                <a href="${url.link}" class="text-decoration-none" target="_blank">
                    <img src="${url.image}" class="card-img-top" alt="사이트 썸네일">
                </a>
                <div class="card-body">
                    <h5 class="card-title">${url.name}</h5>
                    ${url.description ? `<p class="card-text">${url.description}</p>` : ""}
                    <div class="d-flex align-items-center gap-3 justify-content-end">
                        <button class="btn btn-outline-primary btn-sm">
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


