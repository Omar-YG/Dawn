/**
 * Fajr Reader Assistant - Single File JS + CSS Plugin
 * تصميم مدمج بالكامل لتعمل الإضافة بسطر كود واحد
 */
(function() {
    'use strict';

    // 1. حقن الـ CSS مباشرة داخل الصفحة
    const style = document.createElement('style');
    style.innerHTML = `
        #fajr-bubble {
            position: fixed;
            bottom: 25px;
            right: 25px;
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #2980b9, #2c3e50);
            border-radius: 50%;
            box-shadow: 0 8px 25px rgba(0,0,0,0.2);
            cursor: pointer;
            z-index: 999999;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.3s ease;
        }
        #fajr-bubble:hover {
            transform: scale(1.1);
        }
        #fajr-bubble::after {
            content: '';
            width: 20px;
            height: 20px;
            border: 2px solid white;
            border-radius: 50%;
            border-top-color: transparent;
        }
        
        #fajr-chat-box {
            position: fixed;
            bottom: 85px;
            right: 25px;
            width: 320px;
            height: 400px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.3);
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
            font-size: 14pt;
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
        .fajr-highlight-btn {
            position: absolute;
            background: #2c3e50;
            color: white;
            padding: 5px 10px;
            border-radius: 6px;
            font-size: 9pt;
            cursor: pointer;
            z-index: 1000000;
            box-shadow: 0 4px 10px rgba(0,0,0,0.2);
        }
        .fajr-highlighted-text {
            background-color: rgba(41, 128, 185, 0.2);
            transition: background 0.5s;
        }
    `;
    document.head.appendChild(style);

    // 2. بناء عناصر الواجهة (HTML)
    const container = document.createElement('div');
    container.innerHTML = `
        <div id="fajr-bubble" title="مساعد فَجر"></div>
        <div id="fajr-chat-box">
            <div id="fajr-chat-header">فَجر - مساعد القراءة</div>
            <div id="fajr-chat-body">
                <p style="color: #666; margin: 0;">أهلاً بك! اكتب للبحث في نص الصفحة أو حدد أي فقرة للـ (+ تذكر).</p>
                <div id="fajr-results" style="margin-top: 10px;"></div>
            </div>
            <input type="text5" id="fajr-chat-input" placeholder="ابحث في محتوى الصفحة...">
        </div>
    `;
    document.body.appendChild(container);

    // 3. المنطق البرمجي (Logic)
    const bubble = document.getElementById('fajr-bubble');
    const chatBox = document.getElementById('fajr-chat-box');
    const input = document.getElementById('fajr-chat-input');
    const resultsDiv = document.getElementById('fajr-results');

    // فتح وغلق الشات
    bubble.addEventListener('click', () => {
        chatBox.style.display = chatBox.style.display === 'flex' ? 'none' : 'flex';
    });

    // استخراج الجمل من المقال للبحث الفوري
    let sentences = [];
    document.querySelectorAll('p, h2, h3').forEach(el => {
        const text = el.innerText.trim();
        if(text.length > 10) {
            sentences.push({ text: text, element: el });
        }
    });

    // فلترة البحث الآني
    input.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        resultsDiv.innerHTML = '';
        if(query.length < 2) return;

        const matches = sentences.filter(s => s.text.toLowerCase().includes(query));
        matches.slice(0, 5).forEach(match => {
            const item = document.div = document.createElement('div');
            item.style.cssText = "padding: 8px; margin-bottom: 5px; background: #f1f5f9; border-radius: 6px; cursor: pointer; font-size: 9pt;";
            item.innerText = match.text.substring(0, 80) + '...';
            
            // عند الضغط، اعمل Scroll للجملة
            item.addEventListener('click', () => {
                match.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                match.element.classList.add('fajr-highlighted-text');
                setTimeout(() => match.element.classList.remove('fajr-highlighted-text'), 2000);
            });
            resultsDiv.appendChild(item);
        });
    });

    // زر (+ تذكر) عند تحديد النص
    let highlightBtn = null;
    document.addEventListener('mouseup', (e) => {
        const selection = window.getSelection();
        const selectedText = selection.toString().trim();

        if (highlightBtn) highlightBtn.remove();

        if (selectedText.length > 3) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();

            highlightBtn = document.createElement('div');
            highlightBtn.className = 'fajr-highlight-btn';
            highlightBtn.innerText = '+ تذكر';
            highlightBtn.style.top = `${window.scrollY + rect.top - 35}px`;
            highlightBtn.style.left = `${window.scrollX + rect.left}px`;

            highlightBtn.addEventListener('click', () => {
                let saved = JSON.parse(localStorage.getItem('fajr_saved') || '[]');
                saved.push({ text: selectedText, date: new Date().toLocaleDateString() });
                localStorage.setItem('fajr_saved', JSON.stringify(saved));
                highlightBtn.remove();
                alert('تم الحفظ محلياً بنجاح في فَجر! 🧠✨');
            });

            document.body.appendChild(highlightBtn);
        }
    });

})();