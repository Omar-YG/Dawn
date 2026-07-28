/**
 * Fajr Reader & UI Assistant (Dawn Assistant)
 * Complete Single-File Script: Custom Cursor + Smart Search + Local Bookmarks
 */
(function() {
    'use strict';

    // 1. حقن الـ CSS بالكامل (مؤشر فَجر، الشات، الأزرار، والـ Glassmorphism)
    const style = document.createElement('style');
    style.innerHTML = `
        /* مؤشر فَجر التفاعلي */
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
            translate: -50% -50%;
            background: rgba(255, 255, 255, 0.4);
            backdrop-filter: blur(4px);
            transition: width 0.2s, height 0.2s, transform 0.2s, background 0.3s, border-radius 0.2s, border-style 0.2s;
        }
        body:active #fajr-cursor {
            transform: scale(0.7);
            background: #28a745;
            border-color: #fff;
        }
        body:has(a:hover, button:hover, .dropdown-trigger:hover, #fajr-bubble:hover) #fajr-cursor {
            transform: scale(1.6);
            background: rgba(0, 123, 255, 0.1);
            border-style: dashed;
        }
        body:has(input:hover, textarea:hover) #fajr-cursor {
            width: 2px;
            height: 30px;
            border-radius: 5px;
            background: #007bff;
        }
        body:has(li:hover) #fajr-cursor {
            transform: scale(1.2);
            background: #007bff;
            border-color: #fff;
        }

        /* أيقونة فَجر العائمة (الشعار) */
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
            cursor: pointer;
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.3s ease;
        }
        #fajr-bubble:hover { transform: scale(1.1); }
        #fajr-bubble svg {
            width: 30px;
            height: 30px;
        }

        /* صندوق الشات والبحث */
        #fajr-chat-box {
            position: fixed;
            bottom: 85px;
            right: 25px;
            width: 320px;
            height: 420px;
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
            cursor: pointer;
            font-size: 8.5pt;
            transition: background 0.2s;
        }
        #fajr-toggle-view:hover { background: rgba(255,255,255,0.35); }
        
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
        .fajr-highlight-btn {
            position: absolute;
            background: #2c3e50;
            color: white;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 9pt;
            cursor: pointer;
            z-index: 1000000;
            box-shadow: 0 4px 10px rgba(0,0,0,0.25);
            font-weight: bold;
        }
        .fajr-highlighted-text {
            background-color: rgba(0, 123, 255, 0.25) !important;
            transition: background 0.5s;
        }
    `;
    document.head.appendChild(style);

    // 2. بناء الهيكل المرئي (المؤشر + الشات مع الشعار SVG)
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
                <p style="color: #666; margin: 0 0 10px 0;">أهلاً بك! اكتب للبحث في نص الصفحة، أو حدد أي نص لاستخدام (+ تذكر).</p>
                <div id="fajr-results"></div>
            </div>
            <input type="text" id="fajr-chat-input" placeholder="ابحث في محتوى الصفحة...">
        </div>
    `;
    document.body.appendChild(container);

    // 3. تتبع حركة المؤشر (Custom Cursor Tracking)
    const cursor = document.getElementById('fajr-cursor');
    document.addEventListener('mousemove', (e) => {
        cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    });

    const bubble = document.getElementById('fajr-bubble');
    const chatBox = document.getElementById('fajr-chat-box');
    const input = document.getElementById('fajr-chat-input');
    const chatBody = document.getElementById('fajr-chat-body');
    const toggleBtn = document.getElementById('fajr-toggle-view');

    // تجميع الجمل وفتح وغلق الشات
    let sentences = [];
    let isShowingSaved = false;

    bubble.addEventListener('click', () => {
        const isOpen = chatBox.style.display === 'flex';
        chatBox.style.display = isOpen ? 'none' : 'flex';
        
        if (!isOpen && !isShowingSaved) {
            sentences = [];
            document.querySelectorAll('p, h1, h2, h3, li').forEach(el => {
                const text = el.innerText.trim();
                if(text.length > 5) {
                    sentences.push({ text: text, element: el });
                }
            });
        }
    });

    // 4. نظام التبديل بين (بحث) و (المحفوظات)
    toggleBtn.addEventListener('click', () => {
        isShowingSaved = !isShowingSaved;
        
        if (isShowingSaved) {
            toggleBtn.innerText = 'بحث 🔍';
            chatBody.innerHTML = '<div style="font-weight: bold; margin-bottom: 8px; color: #2c3e50;">نصوصك المحفوظة محلياً:</div>';
            
            let savedItems = JSON.parse(localStorage.getItem('fajr_saved') || '[]');
            
            if (savedItems.length === 0) {
                chatBody.innerHTML += '<div style="color: #999; font-size: 9pt;">لم تقم بحفظ أي نص بعد.. حدد أي نص في المقال واضغط (+ تذكر).</div>';
            } else {
                savedItems.forEach((item) => {
                    const itemDiv = document.createElement('div');
                    itemDiv.style.cssText = "background: #f8fafc; padding: 8px; margin-bottom: 6px; border-radius: 6px; font-size: 9pt; border-right: 3px solid #007bff;";
                    itemDiv.innerHTML = `"${item.text}" <div style="font-size: 7.5pt; color: #888; margin-top: 4px;">${item.date}</div>`;
                    chatBody.appendChild(itemDiv);
                });
            }
        } else {
            toggleBtn.innerText = 'المحفوظات 📁';
            chatBody.innerHTML = `
                <p style="color: #666; margin: 0 0 10px 0;">أهلاً بك! اكتب للبحث في نص الصفحة، أو حدد أي نص لاستخدام (+ تذكر).</p>
                <div id="fajr-results"></div>
            `;
            // إعادة ربط حقل البحث
            const newResultsDiv = document.createElement('div');
            newResultsDiv.id = 'fajr-results';
            chatBody.appendChild(newResultsDiv);
        }
    });

    // 5. محرك البحث الآني والفلترة داخل الصفحة
    document.addEventListener('input', (e) => {
        if (e.target && e.target.id === 'fajr-chat-input') {
            const query = e.target.value.trim().toLowerCase();
            const resultsDiv = document.getElementById('fajr-results');
            if(!resultsDiv) return;
            
            resultsDiv.innerHTML = '';
            if(query.length < 2) return;

            const matches = sentences.filter(s => s.text.toLowerCase().includes(query));
            
            if (matches.length === 0) {
                resultsDiv.innerHTML = '<div style="color: #999; padding: 5px;">لا توجد نتائج مطابقة..</div>';
                return;
            }

            matches.slice(0, 6).forEach(match => {
                const item = document.createElement('div');
                item.style.cssText = "padding: 8px; margin-bottom: 6px; background: #f1f5f9; border-radius: 6px; cursor: pointer; font-size: 9pt; border-right: 3px solid #007bff;";
                item.innerText = match.text.substring(0, 75) + '...';
                
                item.addEventListener('click', () => {
                    match.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    match.element.classList.add('fajr-highlighted-text');
                    setTimeout(() => match.element.classList.remove('fajr-highlighted-text'), 2500);
                });
                resultsDiv.appendChild(item);
            });
        }
    });

    // 6. ميزة (+ تذكر) عند تحديد النص
    let highlightBtn = null;
    let currentSelectedText = "";

    document.addEventListener('mouseup', (e) => {
        if (chatBox.contains(e.target) || bubble.contains(e.target)) return;

        const selection = window.getSelection();
        currentSelectedText = selection.toString().trim();

        if (highlightBtn) {
            highlightBtn.remove();
            highlightBtn = null;
        }

        if (currentSelectedText.length > 2) {
            try {
                const range = selection.getRangeAt(0);
                const rect = range.getBoundingClientRect();

                highlightBtn = document.createElement('div');
                highlightBtn.className = 'fajr-highlight-btn';
                highlightBtn.innerText = '+ تذكر';
                highlightBtn.style.top = `${window.scrollY + rect.top - 40}px`;
                highlightBtn.style.left = `${window.scrollX + rect.left}px`;

                highlightBtn.addEventListener('click', (ev) => {
                    ev.stopPropagation();
                    let saved = JSON.parse(localStorage.getItem('fajr_saved') || '[]');
                    saved.push({ text: currentSelectedText, date: new Date().toLocaleDateString() });
                    localStorage.setItem('fajr_saved', JSON.stringify(saved));
                    
                    highlightBtn.remove();
                    highlightBtn = null;
                    window.getSelection().removeAllRanges();
                    alert('تم الحفظ محلياً في فَجر بنجاح! 🧠✨');
                });

                document.body.appendChild(highlightBtn);
            } catch (err) {
                console.log(err);
            }
        }
    });

    document.addEventListener('mousedown', (e) => {
        if (highlightBtn && !highlightBtn.contains(e.target)) {
            highlightBtn.remove();
            highlightBtn = null;
        }
    });

})();
