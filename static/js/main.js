// 폴더 안 url list 모달
let selectedFolderId = null

document.addEventListener("DOMContentLoaded", function () {
    // 모든 폴더 링크 요소 선택
    const folderLinks = document.querySelectorAll(".folder-name");
    const selectFolder = document.getElementById("selectFolder");
    
    const firstFolderId = folderLinks[0].dataset.folderId;
    selectedFolderId = firstFolderId
    loadUrlsForFolder(firstFolderId);

    folderLinks.forEach(link => {
        link.addEventListener("click", function (event) {
            event.preventDefault(); // 링크 기본 동작 방지

            const folderName = this.getAttribute("data-folder-name"); // 폴더 이름 가져오기
            
            selectFolder.textContent = folderName; // 폴더 이름 업데이트
        });
    });

    // "추가" 버튼 클릭 시 URL과 별칭을 입력받는 모달 띄우기
    const addUrlButton = document.getElementById("addUrlButton");
    addUrlButton.addEventListener("click", function () {
        const addUrlModal = new bootstrap.Modal(document.getElementById("addUrlModal"));
        addUrlModal.show();
        document.getElementById("urlInput").value = ''; // URL 입력 필드 비우기
        document.getElementById("aliasInput").value = ''; // 설명 입력 필드 비우기
    });

    // 폴더 생성 js
    const createFolderButton = document.getElementById("createFolder");  // 폴더 생성 버튼
    const createFolderModal = new bootstrap.Modal(document.getElementById("createFolderModal"));  // 모달

    // 폴더 생성 버튼 클릭 시 모달 열기
    createFolderButton.addEventListener("click", function () {
        createFolderModal.show();
        document.getElementById("folderNameInput").value = '';
    });

    // URL 추가 버튼 클릭 시 선택된 폴더 ID를 form에 추가
    document.getElementById("addUrlButton").addEventListener("click", function () {
        if (selectedFolderId) {
            let form = document.getElementById("addUrlForm");
            let existingInput = document.getElementById("folderIdInput");
            
            if (!existingInput) {
                let input = document.createElement("input");
                input.type = "hidden";
                input.name = "folder_id";
                input.id = "folderIdInput";
                input.value = selectedFolderId;
                form.appendChild(input);
            } else {
                existingInput.value = selectedFolderId;
            }
        }
    });

});

// 폴더 클릭 시 URL 목록을 가져오는 함수
function loadUrlsForFolder(folderId) {

    fetch(`/get-urls/${folderId}/`)
        .then(response => response.json())
        .then(data => {
            const urlList = data.urls;
            const urlContainer = document.getElementById('url-list-container'); // URL을 표시할 영역
            
            // URL 목록을 동적으로 생성하여 표시
            urlContainer.innerHTML = ''; // 기존 목록 비우기

            if (urlList.length > 0) {
                urlList.forEach(url => {
                    const urlCard = document.createElement('div');
                    // urlCard.classList.add('card', 'mb-3');
                    urlCard.innerHTML = `
                        <a href="${url.link}" class="text-decoration-none" target="_blank">
                            <div class="col">
                                <div class="card">
                                    <img src="${url.image}" class="card-img-top" alt="사이트 썸네일">
                                    <div class="card-body">
                                        <h5 class="card-title">${url.name}</h5>
                                        <p class="card-text">${url.link}</p>
                                    </div>
                                </div>
                            </div>
                        </a>
                    `;
                    urlContainer.appendChild(urlCard);
                });
            } else {
                urlContainer.innerHTML = '<p>이 폴더에는 URL이 없습니다.</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching URL data:', error);
        });
}

// 폴더 이름을 클릭할 때마다 해당 폴더의 URL 목록을 로드
const folderLinks = document.querySelectorAll('.folder-name');
folderLinks.forEach(link => {
    link.addEventListener('click', function(event) {
        event.preventDefault(); // 기본 동작(링크 이동)을 막음
        const folderId = this.dataset.folderId;
        selectedFolderId = this.dataset.folderId;
        loadUrlsForFolder(folderId); // 폴더 ID에 맞는 URL 목록 로드
    });
});

const submitaddUrlButton = document.querySelector('#submitAddUrlButton')
submitaddUrlButton.addEventListener('click',function(event){

    
    const url = document.getElementById("urlInput").value.trim();
    const alias = document.getElementById("aliasInput").value.trim();

    if (!url) {
        alert("URL을 입력하세요.");
        return;
    }

    document.getElementById("urlInput").disabled = true;
    document.getElementById("aliasInput").disabled = true;
    document.getElementById("loadingSpinner").style.display = "block";

    fetch("/add-url/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCsrfToken() // CSRF 토큰 가져오기
        },
        body: JSON.stringify({
            url: url,
            description: alias,
            folder_id: selectedFolderId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
             // 모달 닫기
             const addUrlModalElement = document.getElementById("addUrlModal");
             const addUrlModal = bootstrap.Modal.getInstance(addUrlModalElement); 
             addUrlModal.hide();
            // document.getElementById("addUrlModal").classList.remove("show"); // 모달 닫기
            // document.body.classList.remove("modal-open");
            // document.querySelector(".modal-backdrop").remove();
            
            loadUrlsForFolder(selectedFolderId); // URL 목록 다시 불러오기
        } else {
            alert("오류 발생: " + data.message);
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("서버 오류가 발생했습니다.");
    })
    .finally(() => {
        // 스피너 숨기고 입력 필드 활성화
        document.getElementById("loadingSpinner").style.display = "none"; // 스피너 숨기기
        document.getElementById("urlInput").disabled = false; // 입력 필드 활성화
        document.getElementById("aliasInput").disabled = false; // 입력 필드 활성화
    });

});

function getCsrfToken() {
    return document.querySelector('input[name="csrfmiddlewaretoken"]').value;
}
// document.addEventListener("DOMContentLoaded", function () {
//     const createFolderButton = document.getElementById("createFolder");  // 폴더 생성 버튼
//     const createFolderModal = new bootstrap.Modal(document.getElementById("createFolderModal"));  // 모달

//     // 폴더 생성 버튼 클릭 시 모달 열기
//     createFolderButton.addEventListener("click", function () {
//         createFolderModal.show();
//     });

//     // const saveFolderButton = document.getElementById("saveFolderButton");
//     // saveFolderButton.addEventListener("click", function () {
//     //     const folderName = document.getElementById("folderNameInput").value.trim();

//     //     if (folderName) {

//     //         // 폼 데이터 준비
//     //         const formData = new FormData();
//     //         formData.append('folderName', folderName);
//     //         formData.append('csrfmiddlewaretoken', document.querySelector('[name=csrfmiddlewaretoken]').value);

//     //         // AJAX를 이용해 서버로 폴더 생성 요청
//     //         fetch('/create-folder/', {
//     //             method: 'POST',
//     //             body: formData
//     //         })
//     //         .then(response => response.json())
//     //         .then(data => {
//     //             if (data.success) {
//     //                 location.reload();
//     //             } else {
//     //                 alert('폴더 생성에 실패했습니다.');
//     //             }
//     //         })
//     //         .catch(error => {
//     //             console.error('폴더 생성 중 오류 발생:', error);
//     //             alert('폴더 생성 중 오류가 발생했습니다.');
//     //         });

//     //         // 모달 닫기
//     //         createFolderModal.hide();
//     //     } else {
//     //         alert("폴더 이름을 입력해주세요.");
//     //     }
//     // });
// });

