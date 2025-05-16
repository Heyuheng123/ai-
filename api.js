// API配置
const API_CONFIG = {
    url: 'https://api.coze.cn/open_api/v2/chat',
    token: 'pat_wdkT5rF90t1eZdtEb5HAIvnv4pLhV7ehCyhGuhpgHvQa1qqYEL992G3LZkk8IBzm',
    botId: '7498184740550279208'
};

// 发送请求
async function sendRequest(content) {
    if (!content) {
        throw new Error('sendRequest函数需要content参数');
    }
    
    const requestBody = {
        conversation_id: "123",
        bot_id: API_CONFIG.botId,
        user: "123333333",
        query: content,
        stream: false
    };

    const headers = {
        'Authorization': `Bearer ${API_CONFIG.token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Host': 'api.coze.cn',
        'Connection': 'keep-alive'
    };

    try {
        const response = await fetch(API_CONFIG.url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody)
        });

        // 检查Content-Type是否为JSON
        const contentType = response.headers.get('Content-Type');
        if (!contentType || !contentType.includes('application/json')) {
            const textResponse = await response.text();
            console.log('非JSON响应内容:', textResponse);
            throw new Error(`API返回非JSON格式: ${contentType}`);
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API请求失败(${response.status}): ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        console.log('API响应数据:', JSON.stringify(data, null, 2));
        return data;
    } catch (error) {
        console.error('API调用错误:', error);
        throw error;
    }
}

// 调用API生成标题
async function generateTitles({ researchPurpose = '', researchTopic = '', keywords = [] }) {
    try {
        // 获取其他输入内容
        const researchMethod = document.getElementById('researchMethod').value;
        const researchResult = document.getElementById('researchResult').value;
        const paperLevel = document.getElementById('paperLevel').value;

        // 拼接所有输入内容
        const content =
            `研究目的：${researchPurpose ? researchPurpose : '（未填写）'}\n` +
            `研究主题：${researchTopic ? researchTopic : '（未填写）'}\n` +
            `研究方法：${researchMethod ? researchMethod : '（未填写）'}\n` +
            `研究结果：${researchResult ? researchResult : '（未填写）'}\n` +
            `论文等级：${paperLevel ? paperLevel : '（未填写）'}\n` +
            `关键词：${keywords.length > 0 ? keywords.join('、') : '（未填写）'}\n` +
            `请根据以上信息生成5个合适的论文标题。`;
        console.log('发送请求内容:', content);

        const initialResponse = await sendRequest(content);
        
        // 从messages数组中提取标题信息
        const answerMessage = initialResponse.messages.find(
            message => message.type === 'answer'
        );
        
        if (!answerMessage) {
            console.log('完整响应:', JSON.stringify(initialResponse, null, 2));
            throw new Error('未找到包含标题的响应消息');
        }
        
        // 提取content中的标题
        const titlesContent = answerMessage.content;
        
        // 简化的标题解析逻辑
        const titleRegex = /\[([^\]]+)\]|《([^》]+)》|标题\s*\d+[:：]\s*([^\n]+)/g;
        const titles = [];
        let match;
        
        while ((match = titleRegex.exec(titlesContent)) !== null) {
            if (match[1]) titles.push(match[1].trim()); // 匹配方括号格式
            else if (match[2]) titles.push(match[2].trim()); // 匹配尖括号格式
            else if (match[3]) titles.push(match[3].trim()); // 匹配"标题 X:"格式
        }
        
        if (titles.length === 0) {
            // 尝试更通用的匹配
            const lines = titlesContent.split('\n');
            for (const line of lines) {
                const lineTrimmed = line.trim();
                if (lineTrimmed) {
                    // 提取方括号或尖括号内的内容
                    const bracketMatch = lineTrimmed.match(/\[([^\]]+)\]|《([^》]+)》/);
                    if (bracketMatch) {
                        titles.push(bracketMatch[1] || bracketMatch[2]);
                    } else if (lineTrimmed.startsWith('- 标题')) {
                        // 提取标题后的内容
                        const titleContent = lineTrimmed.replace(/- 标题 \d+[:：]\s*/, '').trim();
                        if (titleContent) titles.push(titleContent);
                    } else {
                        // 直接添加整行（作为最后的手段）
                        titles.push(lineTrimmed);
                    }
                }
            }
        }
        
        if (titles.length === 0) {
            console.log('无法解析标题内容:', titlesContent);
            throw new Error('无法从响应中提取标题');
        }
        
        // 去重并过滤空标题
        const uniqueTitles = [...new Set(titles)].filter(title => title.trim().length > 0);
        
        console.log('提取到的标题:', uniqueTitles);
        return uniqueTitles;
    } catch (error) {
        console.error('API调用错误:', error);
        throw error;
    }
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM加载完成，正在查找按钮元素...');
    
    // 使用多种选择器尝试查找按钮元素
    const generateButton = document.getElementById('generateButton') || 
                          document.querySelector('#generateButton') || 
                          document.querySelector('[data-id="generateButton"]') || 
                          document.querySelector('.generate-button');
    
    if (generateButton) {
        console.log('成功找到按钮元素:', generateButton);
        
        // 添加点击事件监听器
        generateButton.addEventListener('click', async function() {
            try {
                console.log('按钮被点击，开始生成标题...');
                
                // 获取表单数据
                const researchPurpose = document.getElementById('researchPurpose')?.value || '';
                const researchTopic = document.getElementById('researchTopic')?.value || '';
                const keywordsInput = document.getElementById('keywords')?.value || '';
                const keywords = keywordsInput.split(',').map(keyword => keyword.trim()).filter(keyword => keyword);
                
                if (!researchTopic) {
                    alert('请填写研究主题');
                    return; // 直接中断，后面所有代码都不会执行
                }
                
                // 显示加载状态
                const resultContainer = document.getElementById('resultContainer');
                if (resultContainer) {
                    resultContainer.innerHTML = '<div class="loading">生成中...</div>';
                }
                
                // 调用API生成标题
                const titles = await generateTitles({ researchPurpose, researchTopic, keywords });
                
                // 显示结果
                if (resultContainer) {
                    let html = '<ul class="titles-list">';
                    titles.forEach((title, index) => {
                        html += `<li class="title-item"><span class="title-number">标题 ${index + 1}：</span>${title}</li>`;
                    });
                    html += '</ul>';
                    resultContainer.innerHTML = html;
                }
                
                console.log('标题生成成功并显示');
            } catch (error) {
                console.error('生成标题失败:', error);
                
                // 显示错误信息
                const resultContainer = document.getElementById('resultContainer');
                if (resultContainer) {
                    resultContainer.innerHTML = `<div class="error">生成失败: ${error.message}</div>`;
                }
            }
        });
    } else {
        console.error('未找到生成按钮元素，请检查HTML结构');
        
        // 尝试提供更多调试信息
        const bodyContent = document.body.innerHTML;
        const buttonOccurrences = bodyContent.match(/generateButton/g) || [];
        
        if (buttonOccurrences.length > 0) {
            console.log(`找到 ${buttonOccurrences.length} 个可能的按钮引用，但无法通过标准方法获取`);
            console.log('可能的按钮元素:', bodyContent.match(/id="generateButton"|class="generateButton"|data-id="generateButton"/g));
        } else {
            console.log('在页面中未找到任何与"generateButton"相关的元素');
        }
    }
});