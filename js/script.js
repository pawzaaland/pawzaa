/**
 * 毛孩質感生活館 - Pawzaa
 * 共用腳本模組 (js/script.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. 初始化共用導覽列與漢堡選單
  initNavigation();

  // 2. 初始化首頁 JSON 動態內容 (僅在首頁元素存在時執行)
  initHomePageContent();
});

/**
 * 共用導覽列捲動隱顯與手機版漢堡選單控制
 */
function initNavigation() {
  const header = document.querySelector('header');
  const hamburgerBtn = document.getElementById('hamburger-btn');
  const navMenu = document.getElementById('nav-menu');

  // 防護機制：確認核心導覽元件存在
  if (!header || !hamburgerBtn || !navMenu) return;

  const navLinks = navMenu.querySelectorAll('a');
  let lastScrollY = window.scrollY;

  // --- 收合漢堡選單函式 ---
  const closeMenu = () => {
    hamburgerBtn.classList.remove('is-active');
    navMenu.classList.remove('is-active');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    hamburgerBtn.setAttribute('aria-label', '開啟選單');
  };

  // --- 導覽列捲動隱顯邏輯 ---
  window.addEventListener('scroll', () => {
    // 關鍵需求：若漢堡選單處於展開狀態，不因捲動而隱藏導覽列
    if (navMenu.classList.contains('is-active')) {
      return;
    }

    const currentScrollY = window.scrollY;

    // 接近頁面頂端 (<= 10px) 時，強制保持顯示
    if (currentScrollY <= 10) {
      header.classList.remove('nav-hidden');
    } 
    // 向下捲動 -> 隱藏導覽列
    else if (currentScrollY > lastScrollY) {
      header.classList.add('nav-hidden');
    } 
    // 向上捲動 -> 顯示導覽列
    else {
      header.classList.remove('nav-hidden');
    }

    lastScrollY = currentScrollY;
  });

  // --- 漢堡選單點擊展開/收合 ---
  hamburgerBtn.addEventListener('click', () => {
    const isOpen = navMenu.classList.contains('is-active');

    if (isOpen) {
      closeMenu();
    } else {
      hamburgerBtn.classList.add('is-active');
      navMenu.classList.add('is-active');
      hamburgerBtn.setAttribute('aria-expanded', 'true');
      hamburgerBtn.setAttribute('aria-label', '關閉選單');
    }
  });

  // --- 點擊任一導覽連結後收合選單 ---
  navLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // --- 點擊導覽區域外部時自動收合選單 ---
  document.addEventListener('click', (event) => {
    const isClickInside = header.contains(event.target);
    if (!isClickInside && navMenu.classList.contains('is-active')) {
      closeMenu();
    }
  });
}

/**
 * 首頁專用：動態讀取 JSON 資料並渲染至頁面 DOM
 */
function initHomePageContent() {
  // 檢查是否為首頁關鍵元素 (Hero Kicker)
  const heroKicker = document.getElementById('hero-kicker');
  if (!heroKicker) return; // 非首頁時直接中斷執行

  fetch('data/website-content.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('網路回應不正常');
      }
      return response.json();
    })
    .then(data => {
      // 1. 渲染 Hero 區塊內容
      if (data.hero) {
        const kickerEl = document.getElementById('hero-kicker');
        const titleEl = document.getElementById('hero-title');
        const subtitleEl = document.getElementById('hero-subtitle');
        const ctaEl = document.getElementById('hero-cta');

        if (kickerEl) kickerEl.textContent = data.hero.kicker || '';
        if (titleEl) titleEl.textContent = data.hero.title || '';
        if (subtitleEl) subtitleEl.textContent = data.hero.subtitle || '';
        if (ctaEl) ctaEl.textContent = data.hero.cta || '';
      }

      // 2. 渲染特色卡片區塊
      const featuresTitleEl = document.getElementById('features-title');
      const featuresContainer = document.getElementById('features-grid');

      if (featuresTitleEl && data.featuresTitle) {
        featuresTitleEl.textContent = data.featuresTitle;
      }
      if (featuresContainer && data.features && Array.isArray(data.features)) {
        featuresContainer.innerHTML = '';
        data.features.forEach(item => {
          const card = document.createElement('div');
          card.className = 'feature-card';
          card.innerHTML = `
            <img src="${item.imageUrl}" alt="${item.imageAlt || item.title}">
            <h3>${item.title}</h3>
            <p>${item.description}</p>
          `;
          featuresContainer.appendChild(card);
        });
      }

      // 3. 渲染 FAQ 常見問題區塊
      const faqTitleEl = document.getElementById('faq-title');
      const faqContainer = document.getElementById('faq-list');

      if (faqTitleEl && data.faqTitle) {
        faqTitleEl.textContent = data.faqTitle;
      }
      if (faqContainer && data.faq && Array.isArray(data.faq)) {
        faqContainer.innerHTML = '';
        data.faq.forEach(item => {
          const faqItem = document.createElement('div');
          faqItem.className = 'faq-item';
          faqItem.innerHTML = `
            <div class="faq-question">Q：${item.question}</div>
            <div class="faq-answer">A：${item.answer}</div>
          `;
          faqContainer.appendChild(faqItem);
        });
      }

      // 4. 渲染聯絡區塊
      if (data.contact) {
        const contactTitleEl = document.getElementById('contact-title');
        const contactDescEl = document.getElementById('contact-desc');

        if (contactTitleEl) contactTitleEl.textContent = data.contact.title || '';
        if (contactDescEl) contactDescEl.textContent = data.contact.description || '';
      }

      // 5. 渲染頁尾宣告
      if (data.footer) {
        const footerTextEl = document.getElementById('footer-text');
        if (footerTextEl) footerTextEl.textContent = data.footer;
      }
    })
    .catch(error => {
      console.error('載入 website-content.json 失敗:', error);
    });
}