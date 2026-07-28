/**
 * Fajr Reader & UI Assistant - Final Polished Version
 * Transparent Single-Ring SVG Logo + Chat Bubble UI + Horizontal Filterable Saved Bar + Right-Click Copy
 */
(function() {
    'use strict';

    // 1. حقن الـ CSS بالكامل
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

        /* صندوق المحادثة بستايل Chat Bubble */
        #fajr-chat-box {
            position: fixed;
            bottom: 90px;
            right: 25px;
            width: 340px;
            height: 460px;
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(0, 0, 0, 0.1);
            border-radius: 18px;
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

        /* زاوية الـ Chat Bubble (الـ Tail في اليمين تحت) */
        #fajr-chat-box::after {
            content: '';
            position: absolute;
            bottom: -10px;
            right: 25px;
            width: 0;
            height: 0;
            border-left: 10px solid transparent;
            border-right: 10px solid transparent;
            border-top: 10px solid rgba(255, 255, 255, 0.98);
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
        
        #fajr-chat-body {
            flex: 1;
            padding: 12px;
            overflow-y: auto;
            font-size: 10pt;
            color: #333;
            display: flex;
            flex-direction: column;
        }

        /* شريط المحفوظات الأفقي فوق النتائج */
        #fajr-saved-bar-container {
            margin-bottom: 10px;
            border-bottom: 1px solid #eee;
            padding-bottom: 8px;
        }
        #fajr-saved-input {
            width: 100%;
            padding: 6px 10px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 8.5pt;
            outline: none;
            margin-bottom: 6px;
            background: #fff;
        }
        #fajr-saved-horizontal {
            display: flex;
            gap: 6px;
            overflow-x: auto;
            padding-bottom: 4px;
            scrollbar-width: thin;
        }
        .fajr-saved-chip {
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 5px 10px;
            font-size: 8.5pt;
            white-space: nowrap;
            cursor: none !important;
            display: flex;
            align-items: center;
            gap: 6px;
            flex-shrink: 0;
            transition: background 0.2s;
        }
        .fajr-saved-chip:hover {
            background: #e2e8f0;
            border-color: #007bff;
        }
        .fajr-chip-text { max-width: 120px; overflow: hidden; text-overflow: ellipsis; }
        .fajr-chip-goto { color: #007bff; font-weight: bold; font-size: 8pt; }

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

    // 2. بناء الهيكل (شعار حلقة واحدة شفافة + Chat Bubble)
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
                <!-- شريط المحفوظات الأفقي فوق النتائج -->
                <div id="fajr-saved-bar-container">
                    <input type="text" id="fajr-saved-input" placeholder="تصفية المحفوظات...">
                    <div id="fajr-saved-horizontal"></div>
                </div>
                <p style="color: #666; margin: 0 0 10px 0; font-size: 9pt;">ابحث في محتوى الصفحة، واحفظ بضغطة (+).</p>
                <div id="fajr-results" style="flex: 1; overflow-y: auto;"></div>
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
    const savedHorizontal = document.getElementById('fajr-saved-horizontal');
    const savedInput = document.getElementById('fajr-saved-input');

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

    // دالة عرض المحفوظات أفقياً مع التصفية والضغطة اليمنى للنسخ
    function renderSavedBar(filterText = "") {
        savedHorizontal.innerHTML = '';
        let savedItems = JSON.parse(localStorage.getItem('fajr_saved') || '[]');

        if (filterText) {
            savedItems = savedItems.filter(item => normalizeArabic(item.text).includes(normalizeArabic(filterText)));
        }

        if (savedItems.length === 0) {
            savedHorizontal.innerHTML = '<span style="color: #999; font-size: 8pt; padding: 4px;">لا توجد محفوظات مطابقة..</span>';
            return;
        }

        savedItems.forEach((item) => {
            const chip = document.createElement('div');
            chip.className = 'fajr-saved-chip';
            chip.innerHTML = `<span class="chip-text" title="${item.text}">${item.text}</span><span class="fajr-chip-goto">↗</span>`;

            // الانتقال للجملة عند الضغط
            chip.addEventListener('click', () => {
                navigateToSavedItem(item);
            });

            // الضغطة اليمنى (Right Click) لنسخ النص فوراً ومنع القايمة الافتراضية
            chip.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                navigator.clipboard.writeText(item.text).then(() => {
                    const originalText = chip.innerHTML;
                    chip.innerHTML = `<span style="color: #28a745; font-weight: bold;">تم النسخ! ✓</span>`;
                    setTimeout(() => { chip.innerHTML = originalText; }, 1200);
                });
            });

            savedHorizontal.appendChild(chip);
        });
    }

    // تصفية المحفوظات أناء الكتابة في شريطها
    savedInput.addEventListener('input', (e) => {
        renderSavedBar(e.target.value);
    });

    // دالة الانتقال الذكي للعنصر المحفوظ
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

    // فتح وغلق الشات وسحب النصوص وتحديث شريط المحفوظات
    bubble.addEventListener('click', () => {
        const isOpen = chatBox.style.display === 'flex';
        chatBox.style.display = isOpen ? 'none' : 'flex';
        
        if (!isOpen) {
            renderSavedBar();
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
        }
    });

    // 4. محرك البحث الشامل وحفظ النتائج بضغطة زر (+)
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
                resultsDiv.innerHTML = '<div style="color: #999; padding: 5px; font-size: 9pt;">لا توجد نتائج مطابقة..</div>';
                return;
            }

            matches.slice(0, 6).forEach(match => {
                const item = document.createElement('div');
                item.className = 'fajr-result-item';
                
                const textSpan = document.createElement('span');
                textSpan.className = 'fajr-result-text';
                textSpan.innerText = match.text.substring(0, 55) + '...';
                
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
                    
                    saved.push({ 
                        text: match.text, 
                        url: window.location.href, 
                        date: new Date().toLocaleDateString() 
                    });
                    
                    localStorage.setItem('fajr_saved', JSON.stringify(saved));
                    renderSavedBar(); // تحديث الشريط الأفقي فوراً
                    
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
