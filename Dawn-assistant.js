/**
 * Fajr Reader & UI Assistant - Integrated Chips & Chat Bubble Design
 */
(function() {
    'use strict';

    // 1. حقن الـ CSS بالكامل (متوافق مع متغيراتك والـ Chat Bubble)
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

        /* شعار فَجر الشفاف (حلقة واحدة كبيرة) */
        #fajr-bubble {
            position: fixed;
            bottom: 25px;
            right: 25px;
            width: 50px;
            height: 50px;
            background: transparent;
            cursor: none !important;
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.3s ease;
        }
        #fajr-bubble:hover { transform: scale(1.15); }
        #fajr-bubble svg { width: 45px; height: 45px; pointer-events: none; }

        /* صندوق المحادثة بستايل Chat Bubble وتصميمك المطلوب */
        #fajr-chat-box {
            position: fixed;
            bottom: 90px;
            right: 25px;
            width: 350px;
            height: 460px;
            background: var(--mainbg, rgba(255, 255, 255, 0.95));
            backdrop-filter: blur(12px) saturate(180%);
            -webkit-backdrop-filter: blur(12px) saturate(180%);
            border: var(--dborder, 1px solid rgba(0, 0, 0, 0.1));
            color: var(--bcolor, #333);
            border-radius: 30px 30px 5px 30px;
            box-shadow: 0 12px 35px rgba(0,0,0,0.18);
            z-index: 999999;
            display: none;
            flex-direction: column;
            overflow: hidden;
            font-family: 'Segoe UI', Tahoma, sans-serif;
            direction: rtl;
            animation: fajrPop 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes fajrPop {
            0% { transform: scale(0.8); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
        }

        #fajr-chat-header {
            background: rgba(44, 62, 80, 0.85);
            color: white;
            padding: 14px 18px;
            font-weight: bold;
            font-size: 12pt;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: var(--dborder, 1px solid rgba(255,255,255,0.1));
        }
        
        #fajr-chat-body {
            flex: 1;
            padding: 14px;
            overflow-y: auto;
            font-size: 9.5pt;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        /* تنسيق المحفوظات كـ Chips بنفس الستايل مع Ellipsis */
        .fajr-section-title {
            font-size: 8pt;
            font-weight: bold;
            color: #888;
            margin-bottom: 4px;
            text-transform: uppercase;
        }
        
        .fajr-chips-container {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .fajr-saved-chip {
            position: relative;
            max-width: 100%;
            padding: 10px 16px;
            z-index: 1;
            background: var(--mainbg, rgba(240, 244, 248, 0.8));
            backdrop-filter: blur(12px) saturate(180%);
            -webkit-backdrop-filter: blur(12px) saturate(180%);
            border: var(--dborder, 1px solid rgba(0,0,0,0.08));
            color: var(--bcolor, #333);
            line-height: 1.5;
            border-radius: 20px 20px 5px 20px !important;
            cursor: none !important;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 9pt;
            transition: transform 0.2s;
        }
        .fajr-saved-chip:hover {
            transform: translateX(-3px);
            border-color: #007bff;
        }
        .fajr-chip-text {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            flex: 1;
            margin-left: 10px;
        }
        .fajr-chip-goto {
            color: #007bff;
            font-weight: bold;
            font-size: 8.5pt;
            flex-shrink: 0;
        }

        /* نتائج البحث العادية بنفس الستايل */
        .fajr-result-item {
            position: relative;
            max-width: 100%;
            padding: 10px 16px;
            z-index: 1;
            background: var(--mainbg, rgba(245, 247, 250, 0.8));
            backdrop-filter: blur(12px) saturate(180%);
            -webkit-backdrop-filter: blur(12px) saturate(180%);
            border: var(--dborder, 1px solid rgba(0,0,0,0.08));
            color: var(--bcolor, #333);
            line-height: 1.5;
            border-radius: 20px 20px 5px 20px !important;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 9pt;
        }
        .fajr-result-text {
            flex: 1;
            cursor: none !important;
            margin-left: 8px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .fajr-save-inline-btn {
            background: #2c3e50;
            color: white;
            border: none;
            padding: 4px 10px;
            border-radius: 12px;
            cursor: none !important;
            font-size: 7.5pt;
            font-weight: bold;
            flex-shrink: 0;
        }
        .fajr-save-inline-btn:hover { background: #007bff; }

        #fajr-chat-input {
            width: 100%;
            padding: 14px;
            border: none;
            border-top: var(--dborder, 1px solid rgba(0,0,0,0.1));
            outline: none;
            font-size: 9.5pt;
            background: var(--mainbg, rgba(250, 250, 250, 0.9));
            color: var(--bcolor, #333);
        }
        .fajr-highlighted-text {
            background-color: rgba(0, 123, 255, 0.3) !important;
            transition: background 0.5s;
        }
    `;
    document.head.appendChild(style);

    // 2. بناء الهيكل (Chat Bubble)
    const container = document.createElement('div');
    container.innerHTML = `
        <div id="fajr-cursor"></div>
        <div id="fajr-bubble" title="مساعد فَجر">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" stroke="#007bff" stroke-width="12" fill="none"/>
            </svg>
        </div>
        <div id="fajr-chat-box">
            <div id="fajr-chat-header">
                <span>فَجر - مساعد القراءة</span>
            </div>
            <div id="fajr-chat-body">
                <div id="fajr-dynamic-content">
                    <div style="color: #666; font-size: 9pt; text-align: center; margin-top: 20px;">ابحث أو استعرض محفوظاتك بذكاء.. 🔍</div>
                </div>
            </div>
            <input type="text" id="fajr-chat-input" placeholder="ابحث في المحفوظات أو في محتوى الصفحة...">
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
    const chatInput = document.getElementById('fajr-chat-input');

    let allPageTexts = [];

    function normalizeArabic(text) {
        if (!text) return "";
        return text
            .toLowerCase()
            .replace(/[إأآا]/g, "ا")
            .replace(/ة/g, "ه")
            .replace(/ى/g, "ي")
            .replace(/[\u064b-\u0652]/g, "");
    }

    // دالة العرض الموحدة (المحفوظات كأولوية في الظهور فوق، ثم نتائج البحث تحتها)
    function renderContent(searchQuery = "") {
        const dynamicContent = document.getElementById('fajr-dynamic-content');
        if (!dynamicContent) return;
        
        dynamicContent.innerHTML = '';
        let savedItems = JSON.parse(localStorage.getItem('fajr_saved') || '[]');

        // تصفية المحفوظات لو فيه نص بحث
        if (searchQuery.trim()) {
            const normQuery = normalizeArabic(searchQuery);
            savedItems = savedItems.filter(item => normalizeArabic(item.text).includes(normQuery));
        }

        // 1. عرض المحفوظات أولاً (لو موجودة وتطابق البحث)
        if (savedItems.length > 0) {
            const title = document.createElement('div');
            title.className = 'fajr-section-title';
            title.innerText = 'المحفوظات المطابقة:';
            dynamicContent.appendChild(title);

            const chipsWrapper = document.createElement('div');
            chipsWrapper.className = 'fajr-chips-container';

            savedItems.forEach(item => {
                const chip = document.createElement('div');
                chip.className = 'fajr-saved-chip';
                chip.innerHTML = `<span class="fajr-chip-text" title="${item.text}">${item.text}</span><span class="fajr-chip-goto">↗</span>`;

                chip.addEventListener('click', () => navigateToSavedItem(item));
                
                // ضغطة يمنى للنسخ السريع
                chip.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    navigator.clipboard.writeText(item.text).then(() => {
                        const orig = chip.innerHTML;
                        chip.innerHTML = `<span style="color: #28a745; font-weight: bold; width:100%; text-align:center;">تم النسخ! ✓</span>`;
                        setTimeout(() => { chip.innerHTML = orig; }, 1200);
                    });
                });

                chipsWrapper.appendChild(chip);
            });
            dynamicContent.appendChild(chipsWrapper);
        }

        // 2. نتائج البحث في الصفحة (تظهر تحت المحفوظات)
        if (searchQuery.trim().length >= 2) {
            const queryTokens = normalizeArabic(searchQuery).split(/\s+/).filter(Boolean);
            const matches = allPageTexts.filter(s => queryTokens.every(token => s.normalized.includes(token)));

            if (matches.length > 0) {
                const searchTitle = document.createElement('div');
                searchTitle.className = 'fajr-section-title';
                searchTitle.style.marginTop = savedItems.length > 0 ? '15px' : '0';
                searchTitle.innerText = 'نتائج البحث في الصفحة:';
                dynamicContent.appendChild(searchTitle);

                matches.slice(0, 5).forEach(match => {
                    const item = document.createElement('div');
                    item.className = 'fajr-result-item';
                    
                    const textSpan = document.createElement('span');
                    textSpan.className = 'fajr-result-text';
                    textSpan.innerText = match.text;
                    textSpan.title = match.text;
                    
                    textSpan.addEventListener('click', () => {
                        match.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        match.element.classList.add('fajr-highlighted-text');
                        setTimeout(() => match.element.classList.remove('fajr-highlighted-text'), 2500);
                    });

                    const saveBtn = document.createElement('button');
                    saveBtn.className = 'fajr-save-inline-btn';
                    saveBtn.innerText = '+ حفظ';
                    saveBtn.addEventListener('click', (ev) => {
                        ev.stopPropagation();
                        let saved = JSON.parse(localStorage.getItem('fajr_saved') || '[]');
                        saved.push({ text: match.text, url: window.location.href, date: new Date().toLocaleDateString() });
                        localStorage.setItem('fajr_saved', JSON.stringify(saved));
                        renderContent(chatInput.value);
                        
                        saveBtn.innerText = 'تم ✓';
                        saveBtn.style.background = '#28a745';
                        setTimeout(() => {
                            saveBtn.innerText = '+ حفظ';
                            saveBtn.style.background = '#2c3e50';
                        }, 1500);
                    });

                    item.appendChild(textSpan);
                    item.appendChild(saveBtn);
                    dynamicContent.appendChild(item);
                });
            } else if (savedItems.length === 0) {
                dynamicContent.innerHTML += '<div style="color: #888; font-size: 9pt; text-align: center; margin-top: 20px;">لا توجد أي نتائج مطابقة..</div>';
            }
        } else if (savedItems.length === 0) {
            dynamicContent.innerHTML = '<div style="color: #888; font-size: 9pt; text-align: center; margin-top: 20px;">ابحث في المحفوظات أو اكتب للبحث في الصفحة.. 🔍</div>';
        }
    }

    // الانتقال الذكي للعنصر المحفوظ
    function navigateToSavedItem(item) {
        const currentUrl = window.location.href.split('#')[0];
        const savedUrl = (item.url || '').split('#')[0];

        if (savedUrl && currentUrl !== savedUrl) {
            window.location.href = item.url;
            return;
        }

        let targetObj = allPageTexts.find(p => p.text.includes(item.text) || item.text.includes(p.text));
        if (targetObj && targetObj.element) {
            targetObj.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            targetObj.element.classList.add('fajr-highlighted-text');
            setTimeout(() => targetObj.element.classList.remove('fajr-highlighted-text'), 3000);
            chatBox.style.display = 'none';
        } else {
            let foundEl = null;
            document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, span, a').forEach(el => {
                if (el.innerText && el.innerText.includes(item.text)) {
                    foundEl = el;
                }
            });

            if (foundEl) {
                foundEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                foundEl.classList.add('fajr-highlighted-text');
                setTimeout(() => foundEl.classList.remove('fajr-highlighted-text'), 3000);
                chatBox.style.display = 'none';
            } else {
                alert('عذراً، تعذر العثور على الجملة في هذه الصفحة.');
            }
        }
    }

    // فتح وغلق الشات وسحب النصوص
    bubble.addEventListener('click', () => {
        const isOpen = chatBox.style.display === 'flex';
        chatBox.style.display = isOpen ? 'none' : 'flex';
        
        if (!isOpen) {
            chatInput.value = '';
            allPageTexts = [];
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
            renderContent("");
        }
    });

    // تفاعل حقل البحث الموحد لتصفية المحفوظات ونتائج الصفحة معاً
    chatInput.addEventListener('input', (e) => {
        renderContent(e.target.value);
    });

})();
