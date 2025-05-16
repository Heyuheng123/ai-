document.addEventListener('DOMContentLoaded', function() {
    console.log('页面加载完成');

    // 获取按钮元素
    const generateBtn = document.getElementById('generateBtn');
    const testApiBtn = document.getElementById('testApiBtn');
    const addKeywordBtn = document.getElementById('addKeyword');
    const keywordInput = document.getElementById('keywordInput');
    const keywordList = document.getElementById('keywordList');
    const researchTopic = document.getElementById('researchTopic');
    const researchMethod = document.getElementById('researchMethod');
    const researchResult = document.getElementById('researchResult');
    const conciseness = document.getElementById('conciseness');
    const attractiveness = document.getElementById('attractiveness');
    const titleCards = document.getElementById('titleCards');
    const copySingle = document.getElementById('copySingle');

    // 检查按钮是否存在
    if (!generateBtn) {
        console.error('生成标题按钮元素未找到');
        return;
    }

    console.log('按钮元素已找到');

    // 实时显示字符数
    function updateCharCount(inputElement, countElement, maxLength) {
        inputElement.addEventListener('input', function() {
            countElement.textContent = `${inputElement.value.length}/${maxLength}`;
        });
    }

    updateCharCount(researchTopic, researchTopic.nextElementSibling, 100);
    updateCharCount(researchResult, researchResult.nextElementSibling, 500);

    // 生成标题按钮点击事件
    generateBtn.addEventListener('click', async function() {
        const researchPurpose = document.getElementById('researchPurpose').value;
        const researchTopic = document.getElementById('researchTopic').value.trim();
        const keywords = Array.from(document.querySelectorAll('.keyword-tag')).map(tag => tag.textContent.trim());

        // 先校验研究主题
        if (!researchTopic) {
            alert('请填写研究主题');
            return; // 直接中断，后续所有代码都不执行
        }

        try {
            // 调用API，传递所有输入内容
            const result = await window.generateTitles({
                researchPurpose,
                researchTopic,
                keywords
            });
            // result 现在是数组
            const titles = Array.isArray(result) ? result : [];
            // 存储结果到localStorage
            localStorage.setItem('generatedTitles', JSON.stringify(titles));
            // 跳转到结果页面
            window.location.href = 'results.html';
        } catch (error) {
            console.error('生成标题失败:', error);
            alert('生成标题失败，请稍后重试\n' + (error && error.message ? error.message : error));
        }
    });

    // 添加关键词功能
    if (addKeywordBtn && keywordInput && keywordList) {
        addKeywordBtn.addEventListener('click', function() {
            const keyword = keywordInput.value.trim();
        if (keyword) {
            const tag = document.createElement('div');
            tag.className = 'keyword-tag';
            tag.innerHTML = `
                <span>${keyword}</span>
                <button class="delete-keyword">
                    <i class="fas fa-times"></i>
                </button>
            `;
            keywordList.appendChild(tag);
                keywordInput.value = '';
            
                // 添加删除按钮事件
            tag.querySelector('.delete-keyword').addEventListener('click', function() {
                tag.remove();
            });
        }
    });

    // 按回车键添加关键词
        keywordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
                addKeywordBtn.click();
            }
        });
    }

    // 生成标题
    copySingle.addEventListener('click', function() {
        generateTitles();
        // 跳转到等待页面
        window.location.href = 'processing.html';
        // 设置20秒后跳转到结果页面
        setTimeout(function() {
            window.location.href = 'results.html';
        }, 20000);
    });

    // 一键复制所有标题
    document.addEventListener('DOMContentLoaded', function() {
        const copyAllButton = document.getElementById('copyAllTitles');
        if (copyAllButton) {
            copyAllButton.addEventListener('click', function() {
                const titles = document.querySelectorAll('.title-card');
                let allTitles = '';
                titles.forEach(title => {
                    allTitles += title.textContent + '\n';
                });
                navigator.clipboard.writeText(allTitles.trim())
                    .then(() => alert('所有标题已复制到剪贴板！'))
                    .catch(err => console.error('复制失败:', err));
            });
        }
    });

    // 生成标题
    function generateTitles() {
        const topic = researchTopic.value;
        const method = researchMethod.value;
        const result = researchResult.value;
        const keywords = Array.from(keywordList.options).map(option => option.value);
        const concisenessLevel = conciseness.value;
        const attractivenessLevel = attractiveness.value;

        // 清空现有标题
        titleCards.innerHTML = '';

        // 生成示例标题
        const titles = [
            `${topic}的${method}研究：基于${keywords.join('、')}的分析`,
            `${method}视角下的${topic}研究：${result}的实证分析`,
            `${topic}与${keywords[0]}的关系研究：${method}的视角`
        ];

        // 显示标题
        titles.forEach(title => {
            const card = document.createElement('div');
            card.className = 'title-card';
            card.textContent = title;
            titleCards.appendChild(card);
        });
    }
});