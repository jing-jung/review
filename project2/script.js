document.addEventListener('DOMContentLoaded', () => {
    const memoInput = document.getElementById('memoInput');
    const addBtn = document.getElementById('addBtn');
    const memoList = document.getElementById('memoList');

    // 로컬 스토리지에서 메모 불러오기
    let memos = JSON.parse(localStorage.getItem('memos')) || [];

    // 초기 메모 렌더링
    renderMemos();

    // 메모 추가 이벤트
    addBtn.addEventListener('click', addMemo);
    memoInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addMemo();
        }
    });

    function addMemo() {
        const text = memoInput.value.trim();
        if (text !== '') {
            const memo = {
                id: Date.now(),
                text: text
            };
            memos.push(memo);
            saveMemos();
            renderMemos();
            memoInput.value = '';
        }
    }

    function deleteMemo(id) {
        memos = memos.filter(memo => memo.id !== id);
        saveMemos();
        renderMemos();
    }

    function saveMemos() {
        localStorage.setItem('memos', JSON.stringify(memos));
    }

    function renderMemos() {
        memoList.innerHTML = '';
        memos.forEach(memo => {
            const li = document.createElement('li');
            
            const span = document.createElement('span');
            span.textContent = memo.text;
            
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '삭제';
            deleteBtn.className = 'delete-btn';
            deleteBtn.onclick = () => deleteMemo(memo.id);
            
            li.appendChild(span);
            li.appendChild(deleteBtn);
            memoList.appendChild(li);
        });
    }
});