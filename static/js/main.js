// 폴더 안 url list 모달
document.addEventListener("DOMContentLoaded", function () {
    const folderLinks = document.querySelectorAll(".folder-name");

    folderLinks.forEach(folder => {
        folder.addEventListener("click", function (event) {
            event.preventDefault();

            // 폴더 ID 및 폴더 이름 가져오기
            const folderId = this.getAttribute("data-folder-id");
            const folderName = this.getAttribute("data-folder-name");
            // 모달 제목 변경
            document.getElementById("folderModalLabel").innerText = `${folderName} - URL 목록`;

            // URL 리스트 가져오기 (더미 데이터)
            const urlData = {
                1: [{ url: "https://github.com", alias: "GitHub" }, { url: "https://stackoverflow.com", alias: "Stack Overflow" }],
                2: [{ url: "https://news.ycombinator.com", alias: "Hacker News" }, { url: "https://medium.com", alias: "Medium" }],
                3: [{ url: "https://www.python.org", alias: "Python" }, { url: "https://realpython.com", alias: "Real Python" }]
            };

            const urlList = document.getElementById("urlList");
            urlList.innerHTML = ""; // 기존 리스트 초기화

            if (urlData[folderId]) {
                urlData[folderId].forEach(item => {
                    const listItem = document.createElement("li");
                    listItem.className = "list-group-item d-flex justify-content-between align-items-center";
                    listItem.innerHTML = `
                        <a href="${item.url}" target="_blank">${item.alias} (${item.url})</a>
                        <div>
                            <button class="btn btn-sm btn-success me-2 edit-url">수정</button>
                            <button class="btn btn-sm btn-danger delete-url">삭제</button>
                        </div>
                    `;
                    urlList.appendChild(listItem);
                });
            } else {
                urlList.innerHTML = `<li class="list-group-item text-center">URL이 없습니다.</li>`;
            }

            // 모달 표시
            const folderModal = new bootstrap.Modal(document.getElementById("folderModal"));
            folderModal.show();
        });
    });
    
    // "추가" 버튼 클릭 시 URL과 별칭을 입력받는 모달 띄우기
    const addUrlButton = document.getElementById("addUrlButton");
    addUrlButton.addEventListener("click", function () {
        const addUrlModal = new bootstrap.Modal(document.getElementById("addUrlModal"));
        addUrlModal.show();
    });

    // "저장" 버튼 클릭 시 URL과 별칭 저장 처리
    const saveUrlButton = document.getElementById("saveUrlButton");
    saveUrlButton.addEventListener("click", function () {
        const url = document.getElementById("urlInput").value.trim();
        const alias = document.getElementById("aliasInput").value.trim();

        if (url && alias) {
            // 새 URL과 별칭을 처리하는 로직 (여기서는 콘솔에 출력)
            console.log("새 URL 추가:", url);
            console.log("별칭:", alias);

            // 서버로 URL 추가 요청을 보내고, URL 목록을 업데이트하는 코드 추가

            // 모달 닫기
            const addUrlModal = bootstrap.Modal.getInstance(document.getElementById("addUrlModal"));
            addUrlModal.hide();
        } else {
            alert("URL과 별칭을 모두 입력해주세요.");
        }
    });
});

// 폴더 생성 js
document.addEventListener("DOMContentLoaded", function () {
    const createFolderButton = document.getElementById("createFolder");
    const createFolderModal = new bootstrap.Modal(document.getElementById("createFolderModal"));

    // 폴더 생성 버튼 클릭 시 모달 열기
    createFolderButton.addEventListener("click", function () {
        createFolderModal.show();
    });

    // 폴더 생성 모달의 저장 버튼 클릭 시 폴더 생성 처리
    const saveFolderButton = document.getElementById("saveFolderButton");
    saveFolderButton.addEventListener("click", function () {
        const folderName = document.getElementById("folderNameInput").value.trim();

        if (folderName) {
            // AJAX를 이용해 서버로 폴더 생성 요청
            fetch('/create-folder/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
                },
                body: JSON.stringify({ name: folderName })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // 폴더 생성 성공 시 페이지 새로고침
                    location.reload();
                } else {
                    alert('폴더 생성에 실패했습니다.');
                }
            })
            .catch(error => {
                console.error('폴더 생성 중 오류 발생:', error);
                alert('폴더 생성 중 오류가 발생했습니다.');
            });

            // 모달 닫기
            createFolderModal.hide();
        } else {
            alert("폴더 이름을 입력해주세요.");
        }
    });
});

