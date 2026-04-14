const shortenForm = document.getElementById("shortenForm");
const urlInput = document.getElementById("urlInput");
const customAliasInput = document.getElementById("customAlias");
const advancedToggle = document.getElementById("advancedToggle");
const advancedContent = document.getElementById("advancedContent");
const linksList = document.getElementById("linksList");
const refreshLinksBtn = document.getElementById("refreshLinksBtn");
const errorToast = document.getElementById("errorToast");
const successToast = document.getElementById("successToast");
const darkModeToggle = document.getElementById("darkModeToggle");

const settingsToggle = document.getElementById("settingsToggle");
const settingsModal = document.getElementById("settingsModal");
const closeSettingsModal = document.getElementById("closeSettingsModal");
const githubTokenInput = document.getElementById("githubTokenInput");
const saveSettingsBtn = document.getElementById("saveSettingsBtn");

function initDarkMode() {
  const savedMode = localStorage.getItem("darkMode");
  if (savedMode === "true") {
    document.body.classList.add("dark-mode");
    updateThemeIcon();
  }
}

function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  const isDarkMode = document.body.classList.contains("dark-mode");
  localStorage.setItem("darkMode", isDarkMode);
  updateThemeIcon();
}

function updateThemeIcon() {
  const isDarkMode = document.body.classList.contains("dark-mode");
  darkModeToggle.querySelector(".theme-icon").textContent = isDarkMode ? "☀️" : "🌙";
}

shortenForm.addEventListener("submit", handleShortenURL);
advancedToggle.addEventListener("click", toggleAdvancedOptions);
refreshLinksBtn.addEventListener("click", loadAllLinks);
darkModeToggle.addEventListener("click", toggleDarkMode);

settingsToggle.addEventListener("click", () => {
    githubTokenInput.value = localStorage.getItem("githubToken") || "";
    settingsModal.hidden = false;
});

closeSettingsModal.addEventListener("click", () => {
    settingsModal.hidden = true;
});

settingsModal.addEventListener("click", (e) => {
    if (e.target === settingsModal) {
        settingsModal.hidden = true;
    }
});

saveSettingsBtn.addEventListener("click", () => {
    localStorage.setItem("githubToken", githubTokenInput.value.trim());
    settingsModal.hidden = true;
    showSuccess("Đã lưu token thành công!");
});

initDarkMode();
loadAllLinks();

function handleShortenURL(e) {
  e.preventDefault();

  const url = urlInput.value.trim();
  const customAlias = customAliasInput.value.trim();

  if (!url) {
    showError("Vui lòng nhập một URL");
    return;
  }

  const repoInfo = getGitHubUrlInfo();
  if (repoInfo.includes("VUI_LONG_THAY_DOI")) {
      showError("Bạn chưa chạy trên GitHub Pages thật, hoặc hãy sửa getGitHubUrlInfo trong index.html");
      return;
  }

  const token = localStorage.getItem("githubToken");
  if (!token) {
      showError("Vui lòng thiết lập GitHub Token trong mục Cài Đặt (⚙️) trước.");
      settingsToggle.click();
      return;
  }

  const submitBtn = shortenForm.querySelector('button[type="submit"]');
  const orgText = submitBtn.innerHTML;
  submitBtn.innerHTML = 'Đang xử lý <div class="spinner" style="width: 20px; height: 20px; border-width: 3px; display: inline-block; vertical-align: middle; margin-left: 10px;"></div>';
  submitBtn.disabled = true;

  const issueBody = `### Original URL\n${url}\n\n### Custom Alias\n${customAlias}`;
  
  fetch(`https://api.github.com/repos/${repoInfo}/issues`, {
      method: "POST",
      headers: {
          "Authorization": `token ${token}`,
          "Accept": "application/vnd.github.v3+json",
          "Content-Type": "application/json"
      },
      body: JSON.stringify({
          title: "Shorten Link",
          body: issueBody,
          labels: ["new-link"]
      })
  }).then(async response => {
      if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || "Lỗi khi tạo yêu cầu. Vui lòng kiểm tra quyền Token.");
      }
      
      let pendingLinks = JSON.parse(localStorage.getItem("pendingLinks") || "[]");
      const tempId = customAlias || "tự-động-" + Math.random().toString(36).substr(2, 5);
      pendingLinks.unshift({
          id: tempId,
          original_url: url,
          created_at: new Date().toISOString(),
          is_pending: true
      });
      localStorage.setItem("pendingLinks", JSON.stringify(pendingLinks));

      urlInput.value = "";
      customAliasInput.value = "";
      
      showSuccess("Đã tải yêu cầu lên thành công! Vui lòng đợi trong giây lát...");
      loadAllLinks();
  }).catch(err => {
      showError(err.message);
  }).finally(() => {
      submitBtn.innerHTML = orgText;
      submitBtn.disabled = false;
  });
}

function toggleAdvancedOptions() {
  advancedContent.hidden = !advancedContent.hidden;
  advancedToggle.style.opacity = advancedContent.hidden ? "1" : "0.7";
}

async function loadAllLinks() {
  linksList.innerHTML = '<p class="empty-state">Đang tải danh sách liên kết...</p>';
  try {
    const timestamp = new Date().getTime();
    // Cache bust to always get newest links.json
    const response = await fetch(`links.json?t=${timestamp}`);

    if (!response.ok) {
      throw new Error("Không thể tải danh sách liên kết");
    }

    const links = await response.json();
    
    // Merge pending
    let pendingLinks = JSON.parse(localStorage.getItem("pendingLinks") || "[]");
    pendingLinks = pendingLinks.filter(p => !links.some(l => l.original_url === p.original_url && (!p.id.startsWith("tự-động-") ? l.id === p.id : true)));
    localStorage.setItem("pendingLinks", JSON.stringify(pendingLinks));
    
    displayLinksList([...pendingLinks, ...links]);
  } catch (error) {
    console.error("Lỗi:", error);
    let pendingLinks = JSON.parse(localStorage.getItem("pendingLinks") || "[]");
    if (pendingLinks.length > 0) {
        displayLinksList(pendingLinks);
    } else {
        linksList.innerHTML = '<p class="empty-state">Chưa có liên kết nào hoặc không thể tải danh sách. Nếu bạn vừa tạo, hãy đợi 1 phút và tải lại trang.</p>';
    }
  }
}

function displayLinksList(links) {
  if (links.length === 0) {
    linksList.innerHTML = '<p class="empty-state">📭 Chưa có liên kết nào được tạo.</p>';
    return;
  }

  const table = document.createElement("table");
  table.className = "links-table";

  const thead = document.createElement("thead");
  thead.innerHTML = `
    <tr>
      <th>🔗 URL Ngắn</th>
      <th>📌 URL Gốc</th>
      <th>📅 Ngày Tạo</th>
      <th>⚙️ Hành Động</th>
    </tr>
  `;
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  links.forEach((link) => {
    const tr = document.createElement("tr");
    
    if (link.is_pending) {
      tr.innerHTML = `
        <td>
          <span class="table-short-link" style="color:var(--text-light); text-decoration: none; cursor: default; font-style: italic;">
            ⏳ Đang xử lý...
          </span>
        </td>
        <td class="table-original-url" title="${link.original_url}">
          ${link.original_url}
        </td>
        <td>
          <span style="opacity: 0.7;">Vừa xong</span>
        </td>
        <td>
          <span style="font-size: 0.85em; color: var(--text-light);">
            Hệ thống đang cấp phát link. Thường mất 30-60s...
          </span>
        </td>
      `;
    } else {
      const shortUrlPath = "s/" + link.id + "/";
      let base = window.location.origin + window.location.pathname;
      if (base.endsWith("index.html")) base = base.replace('index.html', '');
      if (!base.endsWith('/')) base = base + '/';
      const fullShortUrl = base + shortUrlPath;
      
      tr.innerHTML = `
        <td>
          <a href="${shortUrlPath}" target="_blank" class="table-short-link" style="color:var(--primary)">
            ${link.id}
          </a>
        </td>
        <td class="table-original-url" title="${link.original_url}">
          ${link.original_url}
        </td>
        <td>
          ${formatDate(link.created_at)}
        </td>
        <td>
          <div class="table-actions">
            <button class="action-btn btn-copy-small" onclick="copyLink('${fullShortUrl}')" title="Sao chép liên kết">
              📋
            </button>
            <button class="action-btn btn-qr-icon" onclick="showQrModal('${fullShortUrl}', '${link.id}')" title="Xem mã QR">
              📱
            </button>
          </div>
        </td>
      `;
    }
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);

  linksList.innerHTML = "";
  linksList.appendChild(table);
}

function showQrModal(fullUrl, shortId) {
  const modal = document.createElement("div");
  modal.className = "qr-modal-overlay";
  modal.innerHTML = `
    <div class="qr-modal">
      <button class="qr-modal-close" onclick="this.closest('.qr-modal-overlay').remove()">✕</button>
      <h3>📱 Mã QR cho ${shortId}</h3>
      <div id="qrCodeContainer" class="qr-modal-image" style="background: white; padding: 16px; border-radius: 8px; display: inline-block;"></div>
    </div>
  `;
  document.body.appendChild(modal);

  // Generate QR
  new QRCode(document.getElementById("qrCodeContainer"), {
    text: fullUrl,
    width: 200,
    height: 200,
    colorDark : "#000000",
    colorLight : "#ffffff",
    correctLevel : QRCode.CorrectLevel.H
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

function copyLink(text) {
  navigator.clipboard.writeText(text).then(() => {
    showSuccess("Đã sao chép liên kết! ✅");
  }).catch(() => {
    showError("Không thể sao chép liên kết");
  });
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN") + " " + date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

function showError(message) {
  errorToast.textContent = message;
  errorToast.hidden = false;
  setTimeout(() => { errorToast.hidden = true; }, 4000);
}

function showSuccess(message) {
  successToast.textContent = message;
  successToast.hidden = false;
  setTimeout(() => { successToast.hidden = true; }, 3000);
}
