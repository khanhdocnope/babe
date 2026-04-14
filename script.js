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

  // Construct GitHub Issue URL
  const issueUrl = `https://github.com/${repoInfo}/issues/new?template=shorten_link.yml&title=Shorten+Link&original_url=${encodeURIComponent(url)}&custom_alias=${encodeURIComponent(customAlias)}`;
  
  // Redirect
  window.open(issueUrl, "_blank");
  showSuccess("Đã mở trang tạo yêu cầu trên GitHub!");
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
    displayLinksList(links);
  } catch (error) {
    console.error("Lỗi:", error);
    linksList.innerHTML = '<p class="empty-state">Chưa có liên kết nào hoặc không thể tải danh sách. Nếu bạn vừa tạo, hãy đợi 1 phút và tải lại trang.</p>';
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
