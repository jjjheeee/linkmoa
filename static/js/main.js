let selectedFolderId = null;

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

function loadUrlsForFolder(folderId) {
    fetch(`/get-urls/${folderId}/`)
        .then(response => response.json())
        .then(data => {
            const urlContainer = document.getElementById('url-list-container');
            urlContainer.innerHTML = data.urls.length > 0 ? data.urls.map(url => `
                <a href="${url.link}" class="text-decoration-none" target="_blank">
                    <div class="col">
                        <div class="card">
                            <img src="${url.image}" class="card-img-top" alt="사이트 썸네일">
                            <div class="card-body">
                                <h5 class="card-title">${url.name}</h5>
                                ${url.description ? `<p class="card-text">${url.description}</p>` : ""}
                            </div>
                        </div>
                    </div>
                </a>`).join('') : '<p>이 폴더에는 URL이 없습니다.</p>';
        })
        .catch(error => console.error('Error fetching URL data:', error));
}

function saveUrl() {
    const url = document.getElementById("urlInput").value.trim();
    const alias = document.getElementById("aliasInput").value.trim();
    if (!url) return alert("URL을 입력하세요.");
    toggleLoading(true);
    fetch("/add-url/", {
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

function toggleLoading(isLoading) {
    document.getElementById("loadingSpinner").style.display = isLoading ? "block" : "none";
    document.getElementById("urlInput").disabled = isLoading;
    document.getElementById("aliasInput").disabled = isLoading;
}

function getCsrfToken() {
    return document.querySelector('input[name="csrfmiddlewaretoken"]').value;
}

var msnry = new Masonry('.masonry-container', {
    itemSelector: '.masonry-item',
    columnWidth: 200,
    gutter: 16
});