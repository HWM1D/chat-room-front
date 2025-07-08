
// متغیرهای سراسری
let currentUser = '';
let messages = [];
let replyingTo = null;
let isLightTheme = false;

// عناصر DOM
const loginScreen = document.getElementById('loginScreen');
const chatScreen = document.getElementById('chatScreen');
const usernameInput = document.getElementById('usernameInput');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');
const messagesContainer = document.getElementById('messagesContainer');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const imageInput = document.getElementById('imageInput');
const voiceInput = document.getElementById('voiceInput');
const imageBtn = document.getElementById('imageBtn');
const voiceBtn = document.getElementById('voiceBtn');
const replyPreview = document.getElementById('replyPreview');
const replyText = document.getElementById('replyText');
const cancelReply = document.getElementById('cancelReply');
const onlineCount = document.getElementById('onlineCount');
const themeToggle = document.getElementById('themeToggle');
const logoutBtn = document.getElementById('logoutBtn');
const imageModal = document.getElementById('imageModal');
const modalImage = document.getElementById('modalImage');
const closeModal = document.querySelector('.close-modal');

// رویدادهای ورود
loginBtn.addEventListener('click', handleLogin);
usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
});

// رویدادهای چت
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

imageBtn.addEventListener('click', () => imageInput.click());
voiceBtn.addEventListener('click', () => voiceInput.click());
imageInput.addEventListener('change', handleImageUpload);
voiceInput.addEventListener('change', handleVoiceUpload);

// رویدادهای دیگر
cancelReply.addEventListener('click', cancelReplyMessage);
themeToggle.addEventListener('click', toggleTheme);
logoutBtn.addEventListener('click', logout);
closeModal.addEventListener('click', () => imageModal.classList.add('hidden'));
imageModal.addEventListener('click', (e) => {
    if (e.target === imageModal) imageModal.classList.add('hidden');
});

// تابع ورود
function handleLogin() {
    const username = usernameInput.value.trim();
    
    if (!username) {
        showError('لطفاً نام کاربری را وارد کنید');
        return;
    }
    
    if (username.length < 2) {
        showError('نام کاربری باید حداقل 2 کاراکتر باشد');
        return;
    }
    
    if (username.length > 20) {
        showError('نام کاربری نباید بیش از 20 کاراکتر باشد');
        return;
    }
    
    // بررسی کاراکترهای مجاز
    const validUsername = /^[a-zA-Z0-9آ-ی\s]+$/.test(username);
    if (!validUsername) {
        showError('نام کاربری فقط می‌تواند شامل حروف، اعداد و فاصله باشد');
        return;
    }
    
    currentUser = username;
    loginError.textContent = '';
    
    // انتقال به صفحه چت
    loginScreen.classList.add('hidden');
    chatScreen.classList.remove('hidden');
    
    // اضافه کردن پیام خوشامدگویی
    addWelcomeMessage();
    updateOnlineCount();
    
    // فوکوس روی ورودی پیام
    messageInput.focus();
}

function showError(message) {
    loginError.textContent = message;
    loginError.style.animation = 'slideIn 0.3s ease-out';
}

// تابع ارسال پیام
function sendMessage() {
    const messageText = messageInput.value.trim();
    
    if (!messageText) return;
    
    const message = {
        id: Date.now(),
        username: currentUser,
        content: messageText,
        timestamp: new Date(),
        type: 'text',
        likes: 0,
        likedBy: [],
        replyTo: replyingTo
    };
    
    addMessage(message);
    messageInput.value = '';
    cancelReplyMessage();
    scrollToBottom();
}

// تابع آپلود تصویر
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // بررسی نوع فایل
    if (!file.type.startsWith('image/')) {
        alert('لطفاً فقط فایل تصویر انتخاب کنید');
        return;
    }
    
    // بررسی حجم فایل (حداکثر 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('حجم تصویر نباید بیش از 5 مگابایت باشد');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const message = {
            id: Date.now(),
            username: currentUser,
            content: e.target.result,
            timestamp: new Date(),
            type: 'image',
            likes: 0,
            likedBy: [],
            replyTo: replyingTo
        };
        
        addMessage(message);
        cancelReplyMessage();
        scrollToBottom();
    };
    
    reader.readAsDataURL(file);
    e.target.value = '';
}

// تابع آپلود صدا
function handleVoiceUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // بررسی نوع فایل
    if (!file.type.startsWith('audio/')) {
        alert('لطفاً فقط فایل صوتی انتخاب کنید');
        return;
    }
    
    // بررسی حجم فایل (حداکثر 10MB)
    if (file.size > 10 * 1024 * 1024) {
        alert('حجم فایل صوتی نباید بیش از 10 مگابایت باشد');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const message = {
            id: Date.now(),
            username: currentUser,
            content: e.target.result,
            timestamp: new Date(),
            type: 'audio',
            likes: 0,
            likedBy: [],
            replyTo: replyingTo
        };
        
        addMessage(message);
        cancelReplyMessage();
        scrollToBottom();
    };
    
    reader.readAsDataURL(file);
    e.target.value = '';
}

// تابع اضافه کردن پیام
function addMessage(message) {
    messages.push(message);
    renderMessage(message);
}

// تابع رندر کردن پیام
function renderMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${message.username === currentUser ? 'own' : 'other'}`;
    messageElement.dataset.messageId = message.id;
    
    let replyHtml = '';
    if (message.replyTo) {
        const originalMessage = messages.find(m => m.id === message.replyTo.id);
        if (originalMessage) {
            replyHtml = `
                <div class="reply-info">
                    <strong>پاسخ به ${message.replyTo.username}:</strong>
                    <div>${message.replyTo.content.length > 50 ? message.replyTo.content.substring(0, 50) + '...' : message.replyTo.content}</div>
                </div>
            `;
        }
    }
    
    let contentHtml = '';
    switch (message.type) {
        case 'text':
            contentHtml = `<div class="message-content">${escapeHtml(message.content)}</div>`;
            break;
        case 'image':
            contentHtml = `
                <div class="message-content">
                    <img src="${message.content}" alt="تصویر" class="message-image" onclick="showImageModal('${message.content}')">
                </div>
            `;
            break;
        case 'audio':
            contentHtml = `
                <div class="message-content">
                    <audio controls class="message-audio">
                        <source src="${message.content}" type="audio/mpeg">
                        مرورگر شما از پخش فایل صوتی پشتیبانی نمی‌کند.
                    </audio>
                </div>
            `;
            break;
    }
    
    const isLiked = message.likedBy.includes(currentUser);
    
    messageElement.innerHTML = `
        <div class="message-header">
            <span class="message-username">${escapeHtml(message.username)}</span>
            <span class="message-time">${formatTime(message.timestamp)}</span>
        </div>
        ${replyHtml}
        ${contentHtml}
        <div class="message-actions">
            <button class="action-button" onclick="replyToMessage(${message.id})">
                💬 پاسخ
            </button>
            <button class="action-button ${isLiked ? 'liked' : ''}" onclick="toggleLike(${message.id})">
                ${isLiked ? '❤️' : '🤍'} ${message.likes}
            </button>
        </div>
    `;
    
    messagesContainer.appendChild(messageElement);
}

// تابع پاسخ به پیام
function replyToMessage(messageId) {
    const message = messages.find(m => m.id === messageId);
    if (!message) return;
    
    replyingTo = {
        id: message.id,
        username: message.username,
        content: message.type === 'text' ? message.content : `[${getMessageTypeText(message.type)}]`
    };
    
    replyText.textContent = `${replyingTo.username}: ${replyingTo.content}`;
    replyPreview.classList.remove('hidden');
    messageInput.focus();
}

// تابع لغو پاسخ
function cancelReplyMessage() {
    replyingTo = null;
    replyPreview.classList.add('hidden');
}

// تابع لایک/آنلایک
function toggleLike(messageId) {
    const message = messages.find(m => m.id === messageId);
    if (!message) return;
    
    const userIndex = message.likedBy.indexOf(currentUser);
    
    if (userIndex === -1) {
        // لایک کردن
        message.likedBy.push(currentUser);
        message.likes++;
    } else {
        // آنلایک کردن
        message.likedBy.splice(userIndex, 1);
        message.likes--;
    }
    
    // بروزرسانی نمایش
    updateMessageDisplay(message);
}

// تابع بروزرسانی نمایش پیام
function updateMessageDisplay(message) {
    const messageElement = document.querySelector(`[data-message-id="${message.id}"]`);
    if (!messageElement) return;
    
    const isLiked = message.likedBy.includes(currentUser);
    const likeButton = messageElement.querySelector('.action-button:last-child');
    
    likeButton.innerHTML = `${isLiked ? '❤️' : '🤍'} ${message.likes}`;
    likeButton.classList.toggle('liked', isLiked);
}

// تابع نمایش مودال تصویر
function showImageModal(imageSrc) {
    modalImage.src = imageSrc;
    imageModal.classList.remove('hidden');
}

// تابع تغییر تم
function toggleTheme() {
    isLightTheme = !isLightTheme;
    document.body.classList.toggle('light-theme', isLightTheme);
    themeToggle.textContent = isLightTheme ? '☀️' : '🌙';
}

// تابع خروج
function logout() {
    if (confirm('آیا مطمئن هستید که می‌خواهید از چت‌روم خارج شوید؟')) {
        currentUser = '';
        messages = [];
        replyingTo = null;
        messagesContainer.innerHTML = '';
        messageInput.value = '';
        usernameInput.value = '';
        loginError.textContent = '';
        
        chatScreen.classList.add('hidden');
        loginScreen.classList.remove('hidden');
        
        usernameInput.focus();
    }
}

// تابع پیام خوشامدگویی
function addWelcomeMessage() {
    const welcomeMessage = {
        id: Date.now(),
        username: 'سیستم',
        content: `${currentUser} به چت‌روم خوش آمدید! 🎉`,
        timestamp: new Date(),
        type: 'text',
        likes: 0,
        likedBy: [],
        replyTo: null
    };
    
    addMessage(welcomeMessage);
    scrollToBottom();
}

// تابع بروزرسانی تعداد کاربران آنلاین
function updateOnlineCount() {
    // شبیه‌سازی تعداد کاربران آنلاین
    const count = Math.floor(Math.random() * 50) + 1;
    onlineCount.textContent = count;
}

// توابع کمکی
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatTime(date) {
    return date.toLocaleTimeString('fa-IR', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getMessageTypeText(type) {
    switch (type) {
        case 'image': return 'تصویر';
        case 'audio': return 'فایل صوتی';
        default: return 'پیام';
    }
}

function scrollToBottom() {
    setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 100);
}

// تنظیمات اولیه
document.addEventListener('DOMContentLoaded', function() {
    usernameInput.focus();
    updateOnlineCount();
    
    // بروزرسانی تعداد کاربران آنلاین هر 30 ثانیه
    setInterval(updateOnlineCount, 30000);
});

// افزودن پیام‌های نمونه برای نمایش
function addSampleMessages() {
    const sampleMessages = [
        {
            id: 1,
            username: 'علی',
            content: 'سلام بر همه! چطورید؟',
            timestamp: new Date(Date.now() - 300000),
            type: 'text',
            likes: 3,
            likedBy: ['احمد', 'فاطمه', 'محمد'],
            replyTo: null
        },
        {
            id: 2,
            username: 'فاطمه',
            content: 'سلام علی! خوبم ممنون 😊',
            timestamp: new Date(Date.now() - 240000),
            type: 'text',
            likes: 1,
            likedBy: ['علی'],
            replyTo: {
                id: 1,
                username: 'علی',
                content: 'سلام بر همه! چطورید؟'
            }
        },
        {
            id: 3,
            username: 'محمد',
            content: 'چت‌روم خیلی قشنگ شده! 👍',
            timestamp: new Date(Date.now() - 180000),
            type: 'text',
            likes: 5,
            likedBy: ['علی', 'فاطمه', 'احمد', 'زهرا', 'حسن'],
            replyTo: null
        }
    ];
    
    // اضافه کردن پیام‌های نمونه فقط اگر پیامی وجود نداشته باشد
    if (messages.length === 0) {
        sampleMessages.forEach(message => {
            messages.push(message);
            renderMessage(message);
        });
        scrollToBottom();
    }
}

// بعد از ورود، پیام‌های نمونه را اضافه کن
function addWelcomeMessage() {
    const welcomeMessage = {
        id: Date.now(),
        username: 'سیستم',
        content: `${currentUser} به چت‌روم خوش آمدید! 🎉`,
        timestamp: new Date(),
        type: 'text',
        likes: 0,
        likedBy: [],
        replyTo: null
    };
    
    addMessage(welcomeMessage);
    
    // اضافه کردن پیام‌های نمونه
    setTimeout(() => {
        addSampleMessages();
    }, 1000);
    
    scrollToBottom();
}
