/**
 * Fajr Reader & UI Assistant - Ultimate Version
 * Instant Cursor + Global Text Search + Direct (+) Save from Search + Clickable Saved Scroll
 */
(function() {
    'use strict';

    // 1. حقن الـ CSS
    const style = document.createElement('style');
    style.innerHTML = `
        body, a, button, input, textarea, [role="button"] {
            cursor: none !important;
        }

        #fajr-cursor {
            position: fixed;
            top: 0;
            left: 0;
            width: 15px;
            height: 15px;
            border: 2px solid #007bff;
            border-radius: 50%;
            pointer-events: none;
            z-index: 10000000;
            background: rgba(255, 255, 255, 0.4);
            backdrop-filter: blur(4px);
            transform: translate(-50%, -50%);
            transition: width 0.15s, height 0.15s, background 0.2s, border-radius 0.15s, border-style 0.15s;
        }
        body:active #fajr-cursor {
            transform: translate(-50%, -50%) scale(0.7);
            background: #28a745;
            border-color: #fff;
        }
        body:has(a:hover, button:hover, .dropdown-trigger:hover, #fajr-bubble:hover) #fajr-cursor {
            transform: translate(-50%, -50%) scale(1.6);
            background: rgba(0, 123, 255, 0.1);
            border-style: dashed;
        }
        body:has(input:hover, textarea:hover) #fajr-cursor {
            width: 2px;
            height: 30px;
            border-radius: 5px;
            background: #007bff;
        }

        #fajr-bubble {
            position: fixed;
            bottom: 25px;
            right: 25px;
            width: 50px;
            height: 50px;
            background: rgba(255, 255, 255, 0.9);
            backdrop-filter: blur(8px);
            border: 2px solid #007bff;
            border-radius: 50%;
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
            cursor: none !important;
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.3s ease;
        }
        #fajr-bubble:hover { transform: scale(1.1); }
        #fajr-bubble svg { width: 30px; height: 30px; pointer-events: none; }

        #fajr-chat-box {
            position: fixed;
            bottom: 85px;
            right: 25px;
            width: 330px;
            height: 440px;
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(0, 0, 0, 0.1);
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
            z-index: 999999;
            display: none;
            flex-direction: column;
            overflow: hidden;
            font-family: 'Segoe UI', Tahoma, sans-serif;
            direction: rtl;
        }
        #fajr-chat-header {
            background: #2c3e50;
            color: white;
            padding: 12px 15px;
            font-weight: bold;
            font-size: 13pt;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        #fajr-toggle-view {
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            padding: 3px 9px;
            border-radius: 4px;
            cursor: none !important;
            font-size: 8.5pt;
        }
        #fajr-chat-body {
            flex: 1;
            padding: 12px;
            overflow-y: auto;
            font-size: 10pt;
            color: #333;
        }
        #fajr-chat-input {
            width: 100%;
            padding: 12px;
            border: none;
            border-top: 1px solid #eee;
            outline: none;
            font-size: 10pt;
            background: #f9f9f9;
        }
        .fajr-result-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: #f1f5f9;
            padding: 8px;
            margin-bottom: 6px;
            border-radius: 6px;
            font-size: 9pt;
            border-right: 3px solid #007bff;
        }
        .fajr-result-text {
            flex: 1;
            cursor: none !important;
            margin-left: 8px;
        }
        .fajr-save-inline-btn {
            background: #2c3e50;
            color: white;
            border: none;
            padding: 4px 8px;
            border-radius: 4px;
            cursor: none !important;
            font-size: 8pt;
            font-weight: bold;
        }
        .fajr-save-inline-btn:hover { background: #007bff; }
        .fajr-highlighted-text {
            background-color: rgba(0, 123, 255, 0.3) !important;
            transition: background 0.5s;
        }
    `;
    document.head.appendChild(style);

    // 2. بناء الهيكل
    const container = document.createElement('div');
    container.innerHTML = `
        <div id="fajr-cursor"></div>
        <div id="fajr-bubble" title="مساعد فَجر">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="48" fill="none"/>
                <circle cx="50" cy="50" r="32" stroke="#007bff" stroke-width="10" fill="none"/>
            </svg>
        </div>
        <div id="fajr-chat-box">
            <div id="fajr-chat-header">
                <span>فَجر - مساعد القراءة</span>
                <button id="fajr-toggle-view">المحفوظات 📁</button>
            </div>
            <div id="fajr-chat-body">
                <p style="color: #666; margin: 0 0 10px 0;">ابحث في كل محتوى الصفحة، واحفظ بضغطة زر (+).</p>
                <div id="fajr-results"></div>
            </div>
            <input type="text" id="fajr-chat-input" placeholder="ابحث عن أي جملة أو كلمة...">
        </div>
    `;
    document.body.appendChild(container);

    // 3. حركة المؤشر الفورية
    const cursor = document.getElementById('fajr-cursor');
    window.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    }, { passive: true });

    const bubble = document.getElementById('fajr-bubble');
    const chatBox = document.getElementById('fajr-chat-box');
    const chatBody = document.getElementById('fajr-chat-body');
    const toggleBtn = document.getElementById('fajr-toggle-view');

    let allPageTexts = [];
    let isShowingSaved = false;

    function normalizeArabic(text) {
        if (!text) return "";
        return text
            .toLowerCase()
            .replace(/[إأآا]/g, "ا")
            .replace(/ة/g, "ه")
            .replace(/ى/g, "ي")
            .replace(/[\u064b-\u0652]/g, "");
    }

    // فتح الشات وسحب كل النصوص في الصفحة بلا استثناء
    bubble.addEventListener('click', () => {
        const isOpen = chatBox.style.display === 'flex';
        chatBox.style.display = isOpen ? 'none' : 'flex';
        
        if (!isOpen && !isShowingSaved) {
            allPageTexts = [];
            // سحب كل العناصر التي تحتوي على نصوص داخل الصفحة بالكامل
            const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
                acceptNode: function(node) {
                    if (node.parentNode.closest('#fajr-chat-box') || node.parentNode.closest('#fajr-cursor')) {
                        return NodeFilter.FILTER_REJECT;
                    }
                    return node.nodeValue.trim().length > 3 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
                }
            });

            let node;
            while (node = walker.nextNode()) {
                const text = node.nodeValue.trim();
                allPageTexts.push({
                    text: text,
                    normalized: normalizeArabic(text),
                    element: node.parentNode
                });
            }
        }
    });

    // دالة عرض المحفوظات مع إمكانية الانتقال إليها بضغطة زر
    function renderSavedView() {
        chatBody.innerHTML = '<div style="font-weight: bold; margin-bottom: 8px; color: #2c3e50;">نصوصك المحفوظة (اضغط للانتقال):</div>';
        let savedItems = JSON.parse(localStorage.getItem('fajr_saved') || '[]');
        
        if (savedItems.length === 0) {
            chatBody.innerHTML += '<div style="color: #999; font-size: 9pt;">لم تقم بحفظ أي نص بعد.. ابحث واحفظ باستخدام زر (+) بجانب النتائج.</div>';
        } else {
            savedItems.forEach((item, idx) => {
                const itemDiv = document.createElement('div');
                itemDiv.style.cssText = "background: #f8fafc; padding: 8px; margin-bottom: 6px; border-radius: 6px; font-size: 9pt; border-right: 3px solid #007bff; cursor: none !important;";
                itemDiv.innerHTML = `"${item.text}" <div style="font-size: 7.5pt; color: #888; margin-top: 4px;">${item.date}</div>`;
                
                // عند الضغط على النص المحفوظ، ينتقل إليه مباشرة في المقال
                itemDiv.addEventListener('click', () => {
                    // البحث عن العنصر المطابق للنص المحفوظ في الصفحة
                    let targetObj = allPageTexts.find(p => p.text.includes(item.text) || item.text.includes(p.text));
                    if (targetObj && targetObj.element) {
                        targetObj.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        targetObj.element.classList.add('fajr-highlighted-text');
                        setTimeout(() => targetObj.element.classList.remove('fajr-highlighted-text'), 3000);
                        chatBox.style.display = 'none'; // قفل الشات للتركيز
                    } else {
                        alert('عذراً، لم يعد العنصر موجوداً في الصفحة الحالية.');
                    }
                });

                chatBody.appendChild(itemDiv);
            });
        }
    }

    toggleBtn.addEventListener('click', () => {
        isShowingSaved = !isShowingSaved;
        if (isShowingSaved) {
            toggleBtn.innerText = 'بحث 🔍';
            renderSavedView();
        } else {
            toggleBtn.innerText = 'المحفوظات 📁';
            chatBody.innerHTML = `
                <p style="color: #666; margin: 0 0 10px 0;">ابحث في كل محتوى الصفحة، واحفظ بضغطة زر (+).</p>
                <div id="fajr-results"></div>
            `;
        }
    });

    // 4. محرك البحث والزر المباشر للحفظ (+)
    document.addEventListener('input', (e) => {
        if (e.target && e.target.id === 'fajr-chat-input') {
            const rawQuery = e.target.value.trim();
            const resultsDiv = document.getElementById('fajr-results');
            if(!resultsDiv) return;
            
            resultsDiv.innerHTML = '';
            if(rawQuery.length < 2) return;

            const queryTokens = normalizeArabic(rawQuery).split(/\s+/).filter(Boolean);
            const matches = allPageTexts.filter(s => {
                return queryTokens.every(token => s.normalized.includes(token));
            });
            
            if (matches.length === 0) {
                resultsDiv.innerHTML = '<div style="color: #999; padding: 5px;">لا توجد نتائج مطابقة..</div>';
                return;
            }

            matches.slice(0, 6).forEach(match => {
                const item = document.createElement('div');
                item.className = 'fajr-result-item';
                
                const textSpan = document.createElement('span');
                textSpan.className = 'fajr-result-text';
                textSpan.innerText = match.text.substring(0, 60) + '...';
                
                // الانتقال للجملة عند الضغط عليها من نتائج البحث
                textSpan.addEventListener('click', () => {
                    match.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    match.element.classList.add('fajr-highlighted-text');
                    setTimeout(() => match.element.classList.remove('fajr-highlighted-text'), 2500);
                });

                // زر الحفظ المباشر (+) جنب الاقتراح
                const saveBtn = document.createElement('button');
                saveBtn.className = 'fajr-save-inline-btn';
                saveBtn.innerText = '+ حفظ';
                saveBtn.addEventListener('click', (ev) => {
                    ev.stopPropagation();
                    let saved = JSON.parse(localStorage.getItem('fajr_saved') || '[]');
                    saved.push({ text: match.text, date: new Date().toLocaleDateString() });
                    localStorage.setItem('fajr_saved', JSON.stringify(saved));
                    
                    saveBtn.innerText = 'تم ✓';
                    saveBtn.style.background = '#28a745';
                    setTimeout(() => {
                        saveBtn.innerText = '+ حفظ';
                        saveBtn.style.background = '#2c3e50';
                    }, 1500);
                });

                item.appendChild(textSpan);
                item.appendChild(saveBtn);
                resultsDiv.appendChild(item);
            });
        }
    });

})();
