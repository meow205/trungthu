/**
 * ==========================================================================
 * WEBSITE TRUNG THU TẶNG NGƯỜI YÊU - NÂNG CẤP HOẠT ẢNH & TƯƠNG TÁC
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // 1. TỔNG HỢP ÂM THANH THẦN TIÊN BẰNG WEB AUDIO API (KHÔNG CẦN TẢI FILE)
  // ==========================================================================
  let audioCtx = null;

  function initAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Âm thanh tiếng chuông gió / nốt nhạc thanh thoát
  function playChime(freq = 523.25, type = 'sine', duration = 1.2, volume = 0.08) {
    try {
      initAudioContext();
      if (!audioCtx) return;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(0, audioCtx.currentTime);
      gain.gain.linearRampToValueAtTime(volume, audioCtx.currentTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration + 0.1);
    } catch (e) {}
  }

  // Tiếng đàn Harp vuốt nốt khi mở quà hoặc điều ước
  function playHarpSweep() {
    const freqs = [392.00, 440.00, 523.25, 659.25, 783.99, 1046.50];
    freqs.forEach((f, i) => {
      setTimeout(() => {
        playChime(f, 'sine', 1.4, 0.06);
      }, i * 90);
    });
  }

  // Tiếng cắt bánh vui tai
  function playKnifeSound() {
    playChime(880, 'triangle', 0.2, 0.05);
    setTimeout(() => playChime(1174.66, 'sine', 0.8, 0.07), 150);
  }

  // Tiếng tim đập khi nạp tim
  function playHeartBeat() {
    playChime(220, 'sine', 0.15, 0.08);
    setTimeout(() => playChime(440, 'sine', 0.5, 0.06), 80);
  }


  // ==========================================================================
  // 2. CANVAS BẦU TRỜI: SAO, SAO BĂNG, ĐÈN LỒNG, ĐOM ĐÓM & ĐÈN THẢ THEO Ý MUỐN
  // ==========================================================================
  const canvas = document.getElementById('skyCanvas');
  const ctx = canvas.getContext('2d');
  let width, height;

  function resizeCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // --- SAO TRÊN TRỜI ---
  const stars = [];
  const STAR_COUNT = Math.min(Math.floor(window.innerWidth * 0.18), 160);

  class Star {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 1.8 + 0.5;
      this.alpha = Math.random() * 0.7 + 0.3;
      this.speed = Math.random() * 0.02 + 0.008;
      this.glow = Math.random() > 0.8;
      const colors = ['#ffffff', '#fff8db', '#e0f7fa', '#ffeaa7'];
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }
    update() {
      this.alpha += this.speed;
      if (this.alpha > 1 || this.alpha < 0.2) {
        this.speed = -this.speed;
      }
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, this.alpha));
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();

      if (this.glow) {
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.color;
        ctx.fill();
      }
      ctx.restore();
    }
  }

  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push(new Star());
  }

  // --- SAO BĂNG ---
  const shootingStars = [];

  class ShootingStar {
    constructor(startX, startY) {
      this.x = startX !== undefined ? startX : Math.random() * width;
      this.y = startY !== undefined ? startY : Math.random() * (height * 0.45);
      this.length = Math.random() * 80 + 50;
      this.speed = Math.random() * 9 + 8;
      this.angle = Math.PI / 4 + (Math.random() * 0.2 - 0.1);
      this.opacity = 1;
      this.fadeSpeed = Math.random() * 0.025 + 0.015;
    }
    update() {
      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;
      this.opacity -= this.fadeSpeed;
    }
    draw() {
      if (this.opacity <= 0) return;
      ctx.save();
      ctx.globalAlpha = this.opacity;
      const tailX = this.x - Math.cos(this.angle) * this.length;
      const tailY = this.y - Math.sin(this.angle) * this.length;

      const grad = ctx.createLinearGradient(tailX, tailY, this.x, this.y);
      grad.addColorStop(0, 'rgba(255, 239, 160, 0)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0.95)');

      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(this.x, this.y);
      ctx.stroke();
      ctx.restore();
    }
  }

  function spawnShootingStar() {
    shootingStars.push(new ShootingStar());
    const nextSpawnTime = Math.random() * 3500 + 2500;
    setTimeout(spawnShootingStar, nextSpawnTime);
  }
  setTimeout(spawnShootingStar, 1500);

  // --- ĐÈN LỒNG TRÔI & ĐÈN DO NGƯỜI DÙNG TỰ THẢ ---
  const lanterns = [];
  const LANTERN_COUNT = 9;

  class Lantern {
    constructor(initAtBottom = false, customColor = 'orange', customText = '') {
      this.customColor = customColor;
      this.customText = customText;
      this.reset(initAtBottom);
    }
    reset(initAtBottom = false) {
      this.x = Math.random() * width;
      this.y = initAtBottom ? height + Math.random() * 100 : Math.random() * height;
      this.size = this.customText ? 24 : Math.random() * 14 + 16;
      this.speedY = Math.random() * 0.45 + 0.25;
      this.swingSpeed = Math.random() * 0.02 + 0.01;
      this.swingAngle = Math.random() * Math.PI * 2;
      this.swingRange = Math.random() * 15 + 10;
      this.alpha = Math.random() * 0.45 + 0.55;
    }
    update() {
      this.y -= this.speedY;
      this.swingAngle += this.swingSpeed;
      this.xOffset = Math.sin(this.swingAngle) * this.swingRange;

      if (this.y < -80) {
        if (this.customText) {
          // Xóa đèn người dùng thả khi đã bay khuất
          this.shouldRemove = true;
        } else {
          this.reset(true);
        }
      }
    }
    draw() {
      const renderX = this.x + this.xOffset;
      const renderY = this.y;

      ctx.save();
      ctx.globalAlpha = this.alpha;
      
      let glowColor = 'rgba(255, 120, 60, 0.4)';
      let mainColor = '#ff4757';
      let innerColor = '#ffa502';

      if (this.customColor === 'pink') {
        glowColor = 'rgba(255, 117, 140, 0.5)';
        mainColor = '#ff758c';
        innerColor = '#ffb8b8';
      } else if (this.customColor === 'purple') {
        glowColor = 'rgba(224, 86, 253, 0.5)';
        mainColor = '#be2edd';
        innerColor = '#e056fd';
      } else if (this.customColor === 'gold') {
        glowColor = 'rgba(255, 239, 160, 0.5)';
        mainColor = '#f39c12';
        innerColor = '#ffeaa7';
      }

      // Quầng sáng
      const glowGrad = ctx.createRadialGradient(renderX, renderY, this.size * 0.2, renderX, renderY, this.size * 2.2);
      glowGrad.addColorStop(0, glowColor);
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(renderX, renderY, this.size * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Thân đèn
      ctx.fillStyle = mainColor;
      ctx.beginPath();
      ctx.ellipse(renderX, renderY, this.size * 0.75, this.size, 0, 0, Math.PI * 2);
      ctx.fill();

      // Ruột phát sáng
      ctx.fillStyle = innerColor;
      ctx.beginPath();
      ctx.ellipse(renderX, renderY, this.size * 0.45, this.size * 0.75, 0, 0, Math.PI * 2);
      ctx.fill();

      // Dây tua rua
      ctx.strokeStyle = mainColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(renderX, renderY + this.size);
      ctx.lineTo(renderX, renderY + this.size + 14);
      ctx.stroke();

      // Nếu có chữ lời chúc viết trên đèn
      if (this.customText) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(this.customText.substring(0, 10), renderX, renderY + 4);
      }

      ctx.restore();
    }
  }

  for (let i = 0; i < LANTERN_COUNT; i++) {
    lanterns.push(new Lantern(false));
  }

  // --- ĐOM ĐÓM LẬP LÒE ---
  const fireflies = [];
  const FIREFLY_COUNT = 24;

  class Firefly {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.radius = Math.random() * 2 + 1.2;
      this.vx = (Math.random() - 0.5) * 0.6;
      this.vy = (Math.random() - 0.5) * 0.6;
      this.alpha = Math.random() * 0.7 + 0.2;
      this.pulseSpeed = Math.random() * 0.04 + 0.02;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      this.alpha += this.pulseSpeed;
      if (this.alpha > 0.95 || this.alpha < 0.15) {
        this.pulseSpeed = -this.pulseSpeed;
      }
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, this.alpha));
      
      const glow = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 4.5);
      glow.addColorStop(0, 'rgba(255, 255, 130, 0.85)');
      glow.addColorStop(0.5, 'rgba(246, 229, 141, 0.35)');
      glow.addColorStop(1, 'rgba(246, 229, 141, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  for (let i = 0; i < FIREFLY_COUNT; i++) {
    fireflies.push(new Firefly());
  }

  // --- VÒNG LẶP RENDER CHÍNH ---
  function renderSky() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < stars.length; i++) {
      stars[i].update();
      stars[i].draw();
    }

    for (let i = shootingStars.length - 1; i >= 0; i--) {
      shootingStars[i].update();
      shootingStars[i].draw();
      if (shootingStars[i].opacity <= 0) {
        shootingStars.splice(i, 1);
      }
    }

    for (let i = lanterns.length - 1; i >= 0; i--) {
      lanterns[i].update();
      lanterns[i].draw();
      if (lanterns[i].shouldRemove) {
        lanterns.splice(i, 1);
      }
    }

    for (let i = 0; i < fireflies.length; i++) {
      fireflies[i].update();
      fireflies[i].draw();
    }

    requestAnimationFrame(renderSky);
  }
  renderSky();


  // ==========================================================================
  // 3. HIỆU ỨNG BỤI TIÊN LẤP LÁNH THEO CHUỘT / CHẠM TAY (MAGIC SPARKLE TRAIL)
  // ==========================================================================
  let lastSparkleTime = 0;
  function createSparkleTrail(e) {
    const now = Date.now();
    if (now - lastSparkleTime < 45) return; // Giới hạn tần suất để mượt 60fps
    lastSparkleTime = now;

    const x = e.clientX || (e.touches && e.touches[0].clientX);
    const y = e.clientY || (e.touches && e.touches[0].clientY);
    if (!x || !y) return;

    const sparkle = document.createElement('div');
    sparkle.className = 'magic-sparkle-trail';

    const symbols = ['✨', '⭐', '🌸', '💫'];
    sparkle.textContent = symbols[Math.floor(Math.random() * symbols.length)];

    const size = Math.random() * 12 + 10;
    const tx = (Math.random() - 0.5) * 40 + 'px';
    const ty = (Math.random() - 0.5) * 40 + 'px';

    sparkle.style.left = (x - size / 2) + 'px';
    sparkle.style.top = (y - size / 2) + 'px';
    sparkle.style.fontSize = size + 'px';
    sparkle.style.setProperty('--tx', tx);
    sparkle.style.setProperty('--ty', ty);

    document.body.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 750);
  }

  window.addEventListener('mousemove', createSparkleTrail);
  window.addEventListener('touchmove', createSparkleTrail, { passive: true });


  // ==========================================================================
  // 4. MÀN HÌNH MỞ ĐẦU NÂNG CẤP & TƯƠNG TÁC
  // ==========================================================================
  const welcomeScreen = document.getElementById('welcomeScreen');
  const openGiftBtn = document.getElementById('openGiftBtn');
  const mainWrapper = document.getElementById('mainWrapper');
  const welcomeMoonContainer = document.getElementById('welcomeMoonContainer');
  const welcomeMoon = document.getElementById('welcomeMoon');
  const moonSilhouette = document.querySelector('.moon-rabbit-silhouette');

  // Chạm vào mặt trăng trang đầu: Sáng rực, Thỏ Ngọc nhảy & phun tim
  welcomeMoonContainer.addEventListener('click', (e) => {
    welcomeMoon.classList.remove('glow-burst');
    void welcomeMoon.offsetWidth; // trigger reflow
    welcomeMoon.classList.add('glow-burst');

    if (moonSilhouette) {
      moonSilhouette.classList.add('jump');
      setTimeout(() => moonSilhouette.classList.remove('jump'), 600);
    }

    playHarpSweep();

    // Bắn chùm tim nhỏ từ tâm mặt trăng
    const rect = welcomeMoon.getBoundingClientRect();
    createMiniHeartBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 20);
  });

  // Tương tác chạm vào 2 chiếc đèn lồng treo ở trang mở đầu
  const hangingLanterns = document.querySelectorAll('.hanging-lantern');
  hangingLanterns.forEach(lantern => {
    lantern.addEventListener('click', (e) => {
      e.stopPropagation();
      playChime(659.25, 'sine', 1.0, 0.08);
      lantern.style.animation = 'pendulumSway 1s ease-in-out infinite alternate';
      setTimeout(() => {
        lantern.style.animation = 'pendulumSway 4.5s ease-in-out infinite alternate';
      }, 2000);

      const wishMsg = lantern.getAttribute('data-wish');
      if (wishMsg) {
        showRabbitSpeech(wishMsg);
      }
    });
  });

  // ==========================================================================
  // HÀM MỞ MÓN QUÀ & CHUYỂN VÀO KHÔNG GIAN CHÍNH (HOÀN TOÀN KHÔNG BỊ KẸT)
  // ==========================================================================
  let hasOpenedGift = false;

  function openGift() {
    if (hasOpenedGift) return;
    hasOpenedGift = true;

    // 1. Chuyển đổi màn hình mở đầu ngay lập tức
    if (welcomeScreen) {
      welcomeScreen.classList.add('hidden');
      setTimeout(() => {
        welcomeScreen.style.display = 'none';
      }, 850);
    }

    // 2. Kích hoạt giao diện chính
    if (mainWrapper) {
      mainWrapper.classList.add('visible');
    }

    // 3. Kích hoạt hiển thị cho các phần tử phía trên ngay tức thì
    setTimeout(() => {
      const topElements = document.querySelectorAll('.reveal-on-scroll');
      topElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 1.3) {
          el.classList.add('active');
        }
      });
      if (typeof checkScrollReveal === 'function') {
        checkScrollReveal();
      }
    }, 150);

    // 4. Bắt đầu phát bài hát music.mp3
    try { startMusic(); } catch (e) {}

    // 5. Mưa sao băng chào mừng
    try {
      for (let i = 0; i < 6; i++) {
        setTimeout(() => {
          shootingStars.push(new ShootingStar(Math.random() * width, Math.random() * 200));
        }, i * 250);
      }
    } catch (e) {}
  }

  // Đưa hàm ra window để inline onclick trong HTML gọi được 100%
  window.openGift = openGift;

  // Lắng nghe click nút "Mở món quà"
  if (openGiftBtn) {
    openGiftBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openGift();
    });
  }

  // Lắng nghe click vào dòng gợi ý chạm để mở
  const tapHint = document.querySelector('.tap-hint');
  if (tapHint) {
    tapHint.style.cursor = 'pointer';
    tapHint.addEventListener('click', openGift);
  }

  // Cho phép lướt chuột xuống (wheel) hoặc vuốt tay xuống (touch) ở trang đầu để mở và lướt tiếp
  if (welcomeScreen) {
    welcomeScreen.addEventListener('wheel', (e) => {
      if (e.deltaY > 15) {
        openGift();
      }
    }, { passive: true });

    let touchStartWelcomeY = 0;
    welcomeScreen.addEventListener('touchstart', (e) => {
      touchStartWelcomeY = e.touches[0].clientY;
    }, { passive: true });

    welcomeScreen.addEventListener('touchend', (e) => {
      const touchEndWelcomeY = e.changedTouches[0].clientY;
      if (touchStartWelcomeY - touchEndWelcomeY > 30) {
        openGift();
      }
    }, { passive: true });
  }


  // ==========================================================================
  // 5. THỎ NGỌC ĐỒNG HÀNH (MASCOT PET)
  // ==========================================================================
  const rabbitCompanion = document.getElementById('rabbitCompanion');
  const rabbitSpeechBubble = document.getElementById('rabbitSpeechBubble');
  const rabbitSpeechText = document.getElementById('rabbitSpeechText');

  const rabbitQuotes = [
    "Anh chồng dặn tớ là luôn phải chăm sóc nụ cười cho vợ yêu đấy! 🐰",
    "Vợ yêu có mệt không? Anh chồng bảo ngồi xuống ngắm trăng và ăn bánh cùng anh ấy nè! 🌙",
    "Thỏ Ngọc nghe anh chồng khoe là vợ yêu được 100/10 điểm đáng yêu nhất trần gian luôn! 🥰",
    "Trăng đêm nay rất sáng, nhưng anh chồng bảo nụ cười của vợ còn rực rỡ hơn nhiều! ✨",
    "Anh chồng hứa là những mùa Trung Thu sau và mãi mãi vẫn sẽ luôn ở bên cạnh vợ yêu! ❤️",
    "Chạm vào tớ thêm lần nữa, tớ sẽ thay anh chồng gửi thêm thật nhiều điều ước cho vợ nhé! 🌸",
    "Anh chồng nhắn là thương vợ yêu nhiều lắm đấy, vợ có biết chưa? 🏮",
    "Thỏ Ngọc chúc hai vợ chồng có một mùa Trung Thu thật ấm áp và hạnh phúc ngập tràn nha! 🥮"
  ];
  let quoteIndex = 0;
  let bubbleTimeout = null;

  function showRabbitSpeech(customText = null) {
    clearTimeout(bubbleTimeout);
    rabbitCompanion.classList.add('speech-open');
    rabbitSpeechText.textContent = customText || rabbitQuotes[quoteIndex];
    if (!customText) {
      quoteIndex = (quoteIndex + 1) % rabbitQuotes.length;
    }
    rabbitSpeechBubble.classList.add('show');
    bubbleTimeout = setTimeout(() => {
      rabbitSpeechBubble.classList.remove('show');
      rabbitCompanion.classList.remove('speech-open');
    }, 4500);
  }

  rabbitCompanion.addEventListener('click', () => {
    rabbitCompanion.classList.add('bounce');
    setTimeout(() => rabbitCompanion.classList.remove('bounce'), 600);
    playChime(783.99, 'sine', 0.8, 0.08);

    const rect = rabbitCompanion.getBoundingClientRect();
    createMiniHeartBurst(rect.left + rect.width / 2, rect.top, 10);
    showRabbitSpeech();
  });


  // ==========================================================================
  // 6. [HOẠT ĐỘNG MỚI 1]: CẮT BÁNH TRUNG THU & THƯ BÍ MẬT (NẾU CÓ)
  // ==========================================================================
  const interactiveCake = document.getElementById('interactiveCake');
  const secretCakeScroll = document.getElementById('secretCakeScroll');
  const scrollMessage = document.getElementById('scrollMessage');
  const refreshCakeBtn = document.getElementById('refreshCakeBtn');
  const cakeInstruction = document.getElementById('cakeInstruction');

  if (interactiveCake) {
    const cakeFortunes = [
      "Bên trong chiếc bánh ngọt ngào này là 100% tình yêu và sự cưng chiều chồng dành riêng cho vợ! ❤️",
      "Chiếc bánh này ngọt ngào nhất đêm nay... nhưng vẫn thua nụ cười của vợ một bậc! 🥮✨",
      "Bánh Trung Thu nhân: Bình yên, may mắn và một người chồng luôn yêu thương vợ vô điều kiện! 🌸",
      "Chúc vợ yêu của chồng ăn bánh không bao giờ sợ béo, lúc nào cũng xinh xắn và vui tươi! 🥰",
      "Một miếng bánh thơm, một tách trà ấm, và một người luôn mong những điều tốt đẹp nhất cho vợ! 🌙"
    ];
    let fortuneIdx = 0;
    let isCakeCut = false;

    interactiveCake.addEventListener('click', () => {
      if (isCakeCut) return;
      isCakeCut = true;

      interactiveCake.classList.add('cutting');
      playKnifeSound();

      setTimeout(() => {
        interactiveCake.classList.remove('cutting');
        interactiveCake.classList.add('cut');
        if (cakeInstruction) cakeInstruction.textContent = "✨ Bánh đã được cắt thành công! ✨";

        if (scrollMessage) scrollMessage.textContent = `"${cakeFortunes[fortuneIdx]}"`;
        fortuneIdx = (fortuneIdx + 1) % cakeFortunes.length;
        if (secretCakeScroll) secretCakeScroll.style.display = 'block';

        const rect = interactiveCake.getBoundingClientRect();
        createMiniHeartBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 20);
      }, 450);
    });

    if (refreshCakeBtn) {
      refreshCakeBtn.addEventListener('click', () => {
        isCakeCut = false;
        interactiveCake.classList.remove('cut');
        if (secretCakeScroll) secretCakeScroll.style.display = 'none';
        if (cakeInstruction) cakeInstruction.textContent = "👉 Chạm vào chiếc bánh để dùng dao cắt nhé!";
        playChime(523.25, 'sine', 0.5, 0.05);
      });
    }
  }


  // ==========================================================================
  // 7. [HOẠT ĐỘNG MỚI 2]: THẢ ĐÈN HOA ĐĂNG LÊN TRỜI CAO (NẾU CÓ)
  // ==========================================================================
  const colorBtns = document.querySelectorAll('.color-btn');
  const previewLantern = document.getElementById('previewLantern');
  const previewLanternText = document.getElementById('previewLanternText');
  const lanternMsgInput = document.getElementById('lanternMsgInput');
  const launchLanternBtn = document.getElementById('launchLanternBtn');
  const launchStatus = document.getElementById('launchStatus');
  let selectedLanternColor = 'orange';

  if (colorBtns.length > 0) {
    colorBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        colorBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedLanternColor = btn.getAttribute('data-color');

        if (previewLantern) previewLantern.className = `preview-lantern color-${selectedLanternColor}`;
        playChime(659.25, 'sine', 0.4, 0.05);
      });
    });
  }

  if (lanternMsgInput) {
    lanternMsgInput.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      if (previewLanternText) previewLanternText.textContent = val ? val : "Hạnh Phúc ❤️";
    });
  }

  if (launchLanternBtn) {
    launchLanternBtn.addEventListener('click', () => {
      const msg = (lanternMsgInput && lanternMsgInput.value.trim()) || "Yêu Em ❤️";
      playHarpSweep();

      const newLantern = new Lantern(true, selectedLanternColor, msg);
      newLantern.x = width / 2 + (Math.random() - 0.5) * 150;
      lanterns.push(newLantern);

      shootingStars.push(new ShootingStar(newLantern.x, height * 0.7));

      if (launchStatus) launchStatus.classList.add('show');
      if (lanternMsgInput) lanternMsgInput.value = '';
      if (previewLanternText) previewLanternText.textContent = "Hạnh Phúc ❤️";

      setTimeout(() => {
        if (launchStatus) launchStatus.classList.remove('show');
      }, 4500);

      const rect = launchLanternBtn.getBoundingClientRect();
      createMiniHeartBurst(rect.left + rect.width / 2, rect.top, 25);
    });
  }


  // ==========================================================================
  // 8. POLAROID FLIP 3D (LẬT MẶT SAU ĐỌC NHẬT KÝ BÍ MẬT)
  // ==========================================================================
  const polaroidItems = document.querySelectorAll('.polaroid-item[data-flip]');
  polaroidItems.forEach(item => {
    item.addEventListener('click', () => {
      item.classList.toggle('flipped');
      playChime(item.classList.contains('flipped') ? 659.25 : 523.25, 'sine', 0.4, 0.04);
    });
  });


  // ==========================================================================
  // 9. [HOẠT ĐỘNG MỚI 3]: THANH ĐO ĐỘ NGỌT NGÀO & NẠP TIM
  // ==========================================================================
  const crystalHeartBtn = document.getElementById('crystalHeartBtn');
  const loveProgressBar = document.getElementById('loveProgressBar');
  const loveProgressText = document.getElementById('loveProgressText');
  const tapCounterBadge = document.getElementById('tapCounterBadge');
  const loveMeterStatus = document.getElementById('loveMeterStatus');
  const superLoveBanner = document.getElementById('superLoveBanner');

  let loveProgress = 15;
  let tapCount = 0;

  crystalHeartBtn.addEventListener('click', (e) => {
    tapCount++;
    loveProgress += 15;
    playHeartBeat();

    crystalHeartBtn.classList.remove('squeeze');
    void crystalHeartBtn.offsetWidth;
    crystalHeartBtn.classList.add('squeeze');

    tapCounterBadge.textContent = `+${tapCount}`;

    if (loveProgress >= 100) {
      loveProgressBar.style.width = '100%';
      loveProgressText.textContent = `${loveProgress}% Siêu Ngọt Ngào! 💖`;
      loveMeterStatus.textContent = "🎉 Năng lượng yêu thương đã bùng nổ vượt ngoài tầm vũ trụ! 🎉";
      superLoveBanner.style.display = 'block';

      // Mưa trái tim ăn mừng
      createMiniHeartBurst(window.innerWidth / 2, window.innerHeight / 2, 35);
    } else {
      loveProgressBar.style.width = `${loveProgress}%`;
      loveProgressText.textContent = `${loveProgress}% Ngọt ngào`;
      loveMeterStatus.textContent = `Đã nạp ${tapCount} lần tình cảm... Tiếp tục nào! ✨`;
    }

    const rect = crystalHeartBtn.getBoundingClientRect();
    createMiniHeartBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 8);
  });


  // ==========================================================================
  // 10. HỆ THỐNG ÂM THANH NỀN (CHỈ PHÁT DUY NHẤT BÀI HÁT MUSIC.MP3)
  // ==========================================================================
  const bgMusic = document.getElementById('bgMusic');
  const musicControl = document.getElementById('musicControl');
  const musicIcon = document.getElementById('musicIcon');
  let isPlayingMusic = false;

  function startMusic() {
    if (!bgMusic) return;
    const playPromise = bgMusic.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          isPlayingMusic = true;
          if (musicControl) musicControl.classList.add('playing');
          if (musicIcon) musicIcon.textContent = '🎵';
        })
        .catch((err) => {
          console.log('Chờ tương tác để phát nhạc:', err);
        });
    }
  }

  function toggleMusic() {
    if (!bgMusic) return;
    if (isPlayingMusic && !bgMusic.paused) {
      bgMusic.pause();
      isPlayingMusic = false;
      if (musicControl) musicControl.classList.remove('playing');
      if (musicIcon) musicIcon.textContent = '🔇';
    } else {
      bgMusic.play()
        .then(() => {
          isPlayingMusic = true;
          if (musicControl) musicControl.classList.add('playing');
          if (musicIcon) musicIcon.textContent = '🎵';
        })
        .catch(err => {
          console.warn('Lỗi phát nhạc:', err);
        });
    }
  }

  if (bgMusic) {
    bgMusic.addEventListener('play', () => {
      isPlayingMusic = true;
      if (musicControl) musicControl.classList.add('playing');
      if (musicIcon) musicIcon.textContent = '🎵';
    });
    bgMusic.addEventListener('pause', () => {
      isPlayingMusic = false;
      if (musicControl) musicControl.classList.remove('playing');
      if (musicIcon) musicIcon.textContent = '🔇';
    });
  }

  if (musicControl) {
    musicControl.addEventListener('click', toggleMusic);
  }


  // ==========================================================================
  // 11. BỨC THƯ TÌNH TƯƠNG TÁC (ENVELOPE & TYPEWRITER)
  // ==========================================================================
  const loveLetterLines = [
    "Hôm nay là Trung Thu, giữa rất nhiều lời chúc chồng có thể dành cho vợ thì chồng chỉ mong cuộc đời này về sau sẽ đối xử với cô gái chồng thương thật dịu dàng.",
    "",
    "Mong vợ làm điều mình thích, gặp những người tử tế, mọi thứ thuận lợi và những cố gắng của vợ sẽ nhận được kết quả xứng đáng.",
    "",
    "Mong vợ có thật nhiều ngày vui và nếu có những ngày chẳng vui chút nào thì vợ hãy nhớ vợ không cần phải chịu đựng tất cả một mình.",
    "",
    "Cho dù mọi thứ có tệ đến đâu thì hãy nhớ rằng luôn có chồng ở bên vợ nhé.",
    "",
    "Yêu vợ nhiều! ❤️"
  ];

  const envelope = document.getElementById('envelope');
  const waxSeal = document.getElementById('waxSeal');
  const letterPaper = document.getElementById('letterPaper');
  const typewriterBody = document.getElementById('typewriterBody');
  const letterFooter = document.getElementById('letterFooter');
  const reopenLetterBtn = document.getElementById('reopenLetterBtn');
  let isEnvelopeOpened = false;
  let isTyping = false;

  function typeWriterEffect() {
    if (isTyping) return;
    isTyping = true;
    typewriterBody.innerHTML = '';
    letterFooter.style.display = 'none';

    let lineIndex = 0;
    let charIndex = 0;
    let currentParagraph = null;

    function typeNextChar() {
      if (!isTyping) return; // Đã bỏ qua hoặc hoàn thành
      if (lineIndex >= loveLetterLines.length) {
        letterFooter.style.display = 'block';
        letterFooter.style.animation = 'fadeIn 1s ease';
        isTyping = false;
        reopenLetterBtn.style.display = 'inline-block';
        return;
      }

      const currentLine = loveLetterLines[lineIndex];

      if (charIndex === 0) {
        currentParagraph = document.createElement('p');
        if (currentLine === "") {
          currentParagraph.innerHTML = "&nbsp;";
          typewriterBody.appendChild(currentParagraph);
          lineIndex++;
          setTimeout(typeNextChar, 100);
          return;
        }
        typewriterBody.appendChild(currentParagraph);
      }

      if (charIndex < currentLine.length) {
        currentParagraph.textContent += currentLine.charAt(charIndex);
        charIndex++;
        const delay = Math.random() * 15 + 25;
        setTimeout(typeNextChar, delay);
      } else {
        lineIndex++;
        charIndex = 0;
        setTimeout(typeNextChar, 200);
      }
    }

    typeNextChar();
  }

  function displayFullLetter() {
    isTyping = false;
    typewriterBody.innerHTML = '';
    loveLetterLines.forEach(line => {
      const p = document.createElement('p');
      if (line === '') {
        p.innerHTML = '&nbsp;';
      } else {
        p.textContent = line;
      }
      typewriterBody.appendChild(p);
    });
    letterFooter.style.display = 'block';
    reopenLetterBtn.style.display = 'inline-block';
  }

  function openEnvelope() {
    if (!isEnvelopeOpened) {
      isEnvelopeOpened = true;
      envelope.classList.add('opened');
      playHarpSweep();
      setTimeout(typeWriterEffect, 700);

      const rect = envelope.getBoundingClientRect();
      createMiniHeartBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 15);
    }
  }

  envelope.addEventListener('click', openEnvelope);
  waxSeal.addEventListener('click', (e) => {
    e.stopPropagation();
    openEnvelope();
  });

  if (letterPaper) {
    // Chạm vào giấy thư khi đang gõ để xem trọn vẹn ngay lập tức
    letterPaper.addEventListener('click', (e) => {
      e.stopPropagation();
      if (isTyping) {
        displayFullLetter();
        playChime(659.25, 'sine', 0.5, 0.05);
      }
    });
  }

  reopenLetterBtn.addEventListener('click', () => {
    isTyping = false;
    typeWriterEffect();
  });


  // ==========================================================================
  // 12. PHẦN 5: ĐIỀU ƯỚC DƯỚI TRĂNG
  // ==========================================================================
  const triggerWishBtn = document.getElementById('triggerWishBtn');
  const wishInputBox = document.getElementById('wishInputBox');
  const userWishInput = document.getElementById('userWishInput');
  const submitWishBtn = document.getElementById('submitWishBtn');
  const wishSuccessBox = document.getElementById('wishSuccessBox');
  const displayUserWish = document.getElementById('displayUserWish');
  const mainMoon = document.getElementById('mainMoon');

  triggerWishBtn.addEventListener('click', () => {
    mainMoon.classList.add('super-glow');
    wishInputBox.style.display = 'block';
    triggerWishBtn.style.display = 'none';
    playHarpSweep();

    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        shootingStars.push(new ShootingStar(Math.random() * width, Math.random() * 150));
      }, i * 250);
    }

    setTimeout(() => {
      userWishInput.focus();
    }, 300);
  });

  // ==========================================================================
  // [CẤU HÌNH EMAIL NHẬN ĐIỀU ƯỚC]
  // ==========================================================================
  const RECEIVER_EMAIL = 'pvdat1505@gmail.com';

  // Hiệu ứng pháo hoa sao băng & hộp chúc mừng khi điều ước đã gửi
  function showWishSuccess(wishText) {
    if (typeof playHarpSweep === 'function') playHarpSweep();
    if (wishInputBox) wishInputBox.style.display = 'none';
    if (displayUserWish) displayUserWish.textContent = `"${wishText}"`;
    if (wishSuccessBox) wishSuccessBox.style.display = 'block';

    const btnRect = submitWishBtn ? submitWishBtn.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0 };
    const btnX = btnRect.left + btnRect.width / 2;
    const btnY = btnRect.top;

    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        const star = new ShootingStar(btnX + (Math.random() - 0.5) * 60, btnY);
        star.angle = -Math.PI / 2 + (Math.random() * 0.4 - 0.2);
        star.speed = 12;
        shootingStars.push(star);
      }, i * 120);
    }

    createMiniHeartBurst(btnX, btnY, 25);
  }

  // Tự động kiểm tra nếu vừa được FormSubmit chuyển hướng về sau khi gửi thành công
  if (window.location.search.includes('wish_sent=true')) {
    const savedWish = localStorage.getItem('trung_thu_wish') || 'Mong chúng mình mãi luôn bình yên và hạnh phúc bên nhau! ❤️';
    setTimeout(() => {
      showWishSuccess(savedWish);
      const section = document.getElementById('wishSection');
      if (section) section.scrollIntoView({ behavior: 'smooth' });
    }, 600);
  }

  async function submitWish() {
    const wishText = userWishInput.value.trim();
    if (!wishText) {
      alert('Vợ hãy nhập điều ước của mình vào nhé! ❤️');
      userWishInput.focus();
      return;
    }

    // Hiển thị trạng thái đang gửi
    submitWishBtn.disabled = true;
    const originalBtnHTML = submitWishBtn.innerHTML;
    submitWishBtn.innerHTML = '<span>Đang gửi điều ước...</span> <span class="send-icon">✨</span>';

    try {
      localStorage.setItem('trung_thu_wish', wishText);
    } catch (e) {}

    let sentSuccess = false;

    // KÊNH 1: Gửi qua AJAX URLSearchParams (Simple Request - Safari, iOS, Android, Desktop đều hỗ trợ)
    try {
      const params = new URLSearchParams();
      params.append('_subject', '🌕 [Đêm Trăng Rằm] Vợ yêu vừa gửi cho chồng một điều ước bí mật! ❤️');
      params.append('_template', 'table');
      params.append('_captcha', 'false');
      params.append('✨ Nội dung điều ước', wishText);
      params.append('⏰ Thời gian gửi', new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }));
      params.append('💌 Ghi chú', 'Vợ yêu vừa ước điều này dưới ánh trăng rằm trên trang web!');

      const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(RECEIVER_EMAIL)}`, {
        method: 'POST',
        body: params,
        headers: {
          'Accept': 'application/json'
        },
        mode: 'cors',
        credentials: 'omit'
      });

      const data = await response.json();
      console.log('Phản hồi từ máy chủ email:', data);
      if (data && (data.success === 'true' || data.success === true)) {
        sentSuccess = true;
      }
    } catch (err) {
      console.warn('Lệnh gửi ngầm bị chặn (do Safari ITP / AdBlock), chuyển sang kênh gửi trực tiếp:', err);
    }

    // KÊNH 2: Nếu Safari hoặc AdBlock chặn lệnh gọi ngầm -> Gửi bằng Form chuẩn tự động chuyển hướng về lại web (Bảo đảm 100% không bao giờ trượt)
    if (!sentSuccess) {
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = `https://formsubmit.co/${encodeURIComponent(RECEIVER_EMAIL)}`;

      const currentBaseUrl = window.location.href.split('?')[0].split('#')[0];
      const fields = {
        _subject: '🌕 [Đêm Trăng Rằm] Vợ yêu vừa gửi cho chồng một điều ước bí mật! ❤️',
        _template: 'table',
        _captcha: 'false',
        _next: currentBaseUrl + '?wish_sent=true#wishSection',
        '✨ Nội dung điều ước': wishText,
        '⏰ Thời gian gửi': new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
        '💌 Ghi chú': 'Vợ yêu vừa ước điều này dưới ánh trăng rằm trên trang web!'
      };

      for (const [key, value] of Object.entries(fields)) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      }

      document.body.appendChild(form);
      form.submit();
      return;
    }

    // Nếu Kênh 1 gửi thành công -> Hiện ngay sao băng chúc mừng
    showWishSuccess(wishText);
    submitWishBtn.disabled = false;
    submitWishBtn.innerHTML = originalBtnHTML;
  }

  submitWishBtn.addEventListener('click', submitWish);
  userWishInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      submitWish();
    }
  });


  // ==========================================================================
  // 13. PHẦN 6: NÚT "ANH YÊU EM" & MƯA TRÁI TIM BÙNG NỔ
  // ==========================================================================
  const loveYouBtn = document.getElementById('loveYouBtn');
  const loveModal = document.getElementById('loveModal');
  const closeModalBtn = document.getElementById('closeModalBtn');

  function createHeartRain() {
    const heartEmojis = ['❤️', '💖', '💕', '💗', '💓', '✨', '🌸', '🌕'];
    const totalHearts = 65;

    for (let i = 0; i < totalHearts; i++) {
      setTimeout(() => {
        const heart = document.createElement('div');
        heart.className = 'floating-heart-particle';
        heart.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];
        
        const startX = Math.random() * window.innerWidth;
        const startY = window.innerHeight + 20;

        const endX = (Math.random() - 0.5) * 200 + 'px';
        const endY = -(window.innerHeight + Math.random() * 200) + 'px';
        const duration = Math.random() * 2.5 + 2.5;
        const size = Math.random() * 20 + 18;
        const rot = (Math.random() - 0.5) * 360 + 'deg';

        heart.style.left = startX + 'px';
        heart.style.top = startY + 'px';
        heart.style.fontSize = size + 'px';
        heart.style.setProperty('--end-x', endX);
        heart.style.setProperty('--end-y', endY);
        heart.style.setProperty('--rot', rot);
        heart.style.animationDuration = duration + 's';

        document.body.appendChild(heart);

        setTimeout(() => {
          heart.remove();
        }, duration * 1000);
      }, i * 45);
    }
  }

  function createMiniHeartBurst(originX, originY, count = 20) {
    const heartEmojis = ['❤️', '💖', '✨', '🌕'];
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'floating-heart-particle';
      p.textContent = heartEmojis[Math.floor(Math.random() * heartEmojis.length)];

      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 120 + 40;
      const endX = Math.cos(angle) * dist + 'px';
      const endY = (Math.sin(angle) * dist - 80) + 'px';
      const duration = Math.random() * 1.2 + 1.2;

      p.style.left = originX + 'px';
      p.style.top = originY + 'px';
      p.style.fontSize = (Math.random() * 14 + 14) + 'px';
      p.style.setProperty('--end-x', endX);
      p.style.setProperty('--end-y', endY);
      p.style.setProperty('--rot', (Math.random() * 180 - 90) + 'deg');
      p.style.animationDuration = duration + 's';

      document.body.appendChild(p);
      setTimeout(() => p.remove(), duration * 1000);
    }
  }

  loveYouBtn.addEventListener('click', () => {
    playHarpSweep();
    createHeartRain();
    setTimeout(() => {
      loveModal.classList.add('show');
    }, 600);
  });

  closeModalBtn.addEventListener('click', () => {
    loveModal.classList.remove('show');
    createHeartRain();
  });

  loveModal.addEventListener('click', (e) => {
    if (e.target === loveModal) {
      loveModal.classList.remove('show');
    }
  });


  // ==========================================================================
  // 14. HIỆU ỨNG CUỘN TRANG (SCROLL ANIMATIONS, PROGRESS & PARALLAX)
  // ==========================================================================
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  const scrollProgressLine = document.getElementById('scrollProgressLine');
  const scrollDownHint = document.getElementById('scrollDownHint');

  function checkScrollReveal() {
    const triggerBottom = window.innerHeight * 0.9;
    revealElements.forEach(el => {
      const top = el.getBoundingClientRect().top;
      if (top < triggerBottom) {
        el.classList.add('active');
      }
    });
  }
  window.addEventListener('scroll', checkScrollReveal, { passive: true });

  // Khởi tạo IntersectionObserver cho hiệu ứng cuộn trang mượt mà
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, {
      root: null,
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  }

  // Cập nhật thanh tiến trình cuộn trang, ẩn gợi ý cuộn & Parallax trăng
  let scrollTicking = false;
  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      window.requestAnimationFrame(() => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;

        // Cập nhật thanh tiến trình stardust trên cùng
        if (scrollProgressLine && docHeight > 0) {
          const progress = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
          scrollProgressLine.style.width = `${progress}%`;
        }

        // Làm mờ dần gợi ý cuộn trang khi đã lướt xuống
        if (scrollDownHint) {
          if (scrollTop > 45) {
            scrollDownHint.classList.add('fade-out');
          } else {
            scrollDownHint.classList.remove('fade-out');
          }
        }

        // Hiệu ứng Parallax nhẹ cho mặt trăng khi lướt xuống
        if (mainMoon) {
          mainMoon.style.transform = `translateY(${Math.min(scrollTop * 0.12, 50)}px)`;
        }

        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });

  const fallbackSvgPlaceholders = [
    'images/image1.svg',
    'images/image2.svg',
    'images/image3.svg',
    'images/image4.svg',
    'images/image5.svg',
    'images/image6.svg'
  ];

  const galleryImages = document.querySelectorAll('.gallery-photo');
  galleryImages.forEach((img, idx) => {
    img.addEventListener('error', function() {
      this.src = fallbackSvgPlaceholders[idx % fallbackSvgPlaceholders.length];
    });
  });

  const modalLanternImg = document.getElementById('modalLanternImg');
  if (modalLanternImg) {
    modalLanternImg.addEventListener('error', function() {
      this.src = this.src.replace('.jpg', '.svg');
    });
  }


  // ==========================================================================
  // 15. [HOẠT ĐỘNG 3D]: CÂY THẦN TIÊN & ĐÈN LỒNG 3D XOAY 360 ĐỘ
  // ==========================================================================
  const treeViewport = document.getElementById('tree3DViewport');
  const lanternModal = document.getElementById('lanternModal');
  const lanternModalBackdrop = document.getElementById('lanternModalBackdrop');
  const closeLanternModalBtn = document.getElementById('closeLanternModalBtn');
  const nextLanternBtn = document.getElementById('nextLanternBtn');
  const modalLanternBadge = document.getElementById('modalLanternBadge');
  const modalLanternTitle = document.getElementById('modalLanternTitle');
  const modalPoemText = document.getElementById('modalPoemText');
  const modalWhisperText = document.getElementById('modalWhisperText');
  const litLanternCount = document.getElementById('litLanternCount');
  const reset3DViewBtn = document.getElementById('reset3DViewBtn');

  // Danh sách 8 câu ca dao tục ngữ & tranh ảnh Trung Thu ứng với các lồng đèn
  const lanternStories = [
    {
      badge: "🏮 ĐÈN LỒNG KÝ ỨC #1",
      title: "Đêm Rước Đèn Ông Sao",
      img: "images/lantern_art1.jpg",
      poem: "Tết Trung Thu rước đèn đi chơi,\nEm rước đèn đi khắp phố phường.\nLòng vui sướng với đèn trong tay,\nEm múa ca trong ánh trăng rằm.",
      whisper: "Trung Thu này, niềm vui lớn nhất của chồng là được nắm tay vợ đi qua phố đèn hoa rực rỡ."
    },
    {
      badge: "🥮 ĐÈN LỒNG KÝ ỨC #2",
      title: "Mâm Cỗ Trông Trăng",
      img: "images/lantern_art2.jpg",
      poem: "Muốn ăn cơm nếp trắng ngần,\nThì vào trông lúa tháng Mười với trăng rằm.\nMâm cỗ rằm tháng Tám sum vầy,\nBao nhiêu quả ngọt bấy nhiêu ân tình.",
      whisper: "Mâm cỗ có đủ bưởi đào, bánh nướng ngọt ngào... nhưng ngọt ngào nhất với chồng vẫn luôn là nụ cười của vợ."
    },
    {
      badge: "🦁 ĐÈN LỒNG KÝ ỨC #3",
      title: "Rộn Rã Tiếng Trống Múa Lân",
      img: "images/lantern_art3.jpg",
      poem: "Thùng thình thùng thình trống rộn ràng,\nĐèn ông sao sáng ngập đường làng.\nEm cùng chúng bạn vui ca hát,\nĐón Tết Trung Thu rộn tiếng cười.",
      whisper: "Dẫu phố xá ngoài kia có ồn ào náo nhiệt thế nào, ở bên vợ chồng luôn thấy lòng mình bình yên nhất."
    },
    {
      badge: "🌳 ĐÈN LỒNG KÝ ỨC #4",
      title: "Chú Cuội Ngồi Gốc Cây Đa",
      img: "images/lantern_art4.jpg",
      poem: "Bóng ai như bóng chú Cuội,\nNgồi bên gốc đa, trông về trần gian.\nNgàn năm ôm mối tương tư,\nNhớ người năm cũ ngút ngàn xa xôi.",
      whisper: "Chú Cuội chỉ có cây đa trên cung trăng, còn chồng hạnh phúc hơn chú Cuội nhiều vì đã có vợ ở ngay bên cạnh."
    },
    {
      badge: "🏮 ĐÈN LỒNG KÝ ỨC #5",
      title: "Đèn Kéo Quân Lung Linh",
      img: "images/lantern_art5.jpg",
      poem: "Kéo quân xoay tít vòng tròn,\nBao nhiêu bóng ngọc bấy nhiêu ân tình.\nTrăng soi bóng nước lung linh,\nNguyện cùng tri kỷ trọn tình trăm năm.",
      whisper: "Đèn kéo quân quay tròn như dòng thời gian chảy mãi, nhưng tình cảm chồng dành cho vợ thì trước sau như một."
    },
    {
      badge: "🐇 ĐÈN LỒNG KÝ ỨC #6",
      title: "Thỏ Ngọc Cung Quảng Hàn",
      img: "images/lantern_art6.jpg",
      poem: "Hằng Nga ơi hỡi Hằng Nga,\nCho xin Thỏ Ngọc về nhà rong chơi.\nTrăng rằm sáng tỏ muôn nơi,\nBình an may mắn trao người tôi yêu.",
      whisper: "Thỏ Ngọc trên trăng giã ngọc trường sinh, còn vợ chính là nguồn năng lượng ngọt ngào xua tan mọi âu lo trong chồng."
    },
    {
      badge: "🌊 ĐÈN LỒNG KÝ ỨC #7",
      title: "Trăng Thanh Gió Mát Soi Bóng Nước",
      img: "images/lantern_art7.jpg",
      poem: "Trăng rằm vằng vặc soi gương,\nNgười thương người nhớ vấn vương bao tình.\nĐêm nay dưới ánh trăng thanh,\nCầu cho đôi lứa duyên lành bền lâu.",
      whisper: "Trăng có thể khuyết rồi lại tròn, còn tình cảm chồng dành cho vợ chỉ có ngày càng đong đầy hơn."
    },
    {
      badge: "💑 ĐÈN LỒNG KÝ ỨC #8",
      title: "Trọn Vẹn Duyên Nồng Đêm Trăng",
      img: "images/lantern_art8.jpg",
      poem: "Trăng bao nhiêu tuổi trăng già,\nTình chồng thương vợ đậm đà bấy nhiêu.\nCùng nhau qua bấy sớm chiều,\nTrung Thu trọn vẹn bao điều ước mơ.",
      whisper: "Mong rằng những mùa Trung Thu sau này và mãi mãi về sau, người cùng chồng ngắm trăng vẫn luôn là vợ. ❤️"
    }
  ];

  let currentModalIndex = 0;
  const openedLanternsSet = new Set();

  function openLanternModal(index) {
    currentModalIndex = index % lanternStories.length;
    const story = lanternStories[currentModalIndex];
    if (modalLanternBadge) modalLanternBadge.textContent = story.badge;
    if (modalLanternTitle) modalLanternTitle.textContent = story.title;
    if (modalLanternImg) modalLanternImg.src = story.img;
    if (modalPoemText) modalPoemText.innerHTML = story.poem.replace(/\n/g, '<br>');
    if (modalWhisperText) modalWhisperText.textContent = story.whisper;

    if (lanternModal) {
      lanternModal.classList.add('show');
      document.body.classList.add('modal-open');
    }
    openedLanternsSet.add(currentModalIndex);
    if (litLanternCount) litLanternCount.textContent = openedLanternsSet.size;

    playChime(783.99, 'sine', 0.8, 0.08);

    createMiniHeartBurst(window.innerWidth / 2, window.innerHeight / 2, 20);
  }

  function closeLanternModal() {
    if (lanternModal) {
      lanternModal.classList.remove('show');
      document.body.classList.remove('modal-open');
    }
    playChime(523.25, 'sine', 0.3, 0.04);
  }

  if (closeLanternModalBtn) {
    closeLanternModalBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeLanternModal();
    });
  }
  if (lanternModalBackdrop) {
    lanternModalBackdrop.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeLanternModal();
    });
  }
  if (nextLanternBtn) {
    nextLanternBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openLanternModal(currentModalIndex + 1);
    });
  }

  // Khởi tạo Scene 3D Three.js nếu phần tử tồn tại
  if (treeViewport) {
    init3DScene();
  }

  function init3DScene() {
    if (typeof THREE === 'undefined') {
      console.warn('Three.js chưa tải được, hiển thị canvas fallback.');
      return;
    }

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

    const vpWidth = treeViewport.clientWidth || 800;
    const vpHeight = treeViewport.clientHeight || 540;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060312, 0.008);

    const camera = new THREE.PerspectiveCamera(
      isMobile ? 55 : 45,
      vpWidth / vpHeight,
      0.1,
      1000
    );

    const DEFAULT_CAM_POS = isMobile ? new THREE.Vector3(0, 11, 42) : new THREE.Vector3(0, 9.5, 36);
    const DEFAULT_CAM_TARGET = new THREE.Vector3(0, 6.0, 0);
    camera.position.copy(DEFAULT_CAM_POS);
    camera.lookAt(DEFAULT_CAM_TARGET);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isMobile,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(vpWidth, vpHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.setClearColor(0x000000, 0);
    treeViewport.appendChild(renderer.domElement);

    // ==========================================
    // CONTROLS (ORBITCONTROLS CHUẨN MƯỢT MÀ)
    // ==========================================
    let controls = null;
    let targetCamPos = null;
    let targetCamTarget = null;

    if (typeof THREE.OrbitControls !== 'undefined') {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.maxPolarAngle = Math.PI / 2 + 0.05;
      controls.minDistance = 8;
      controls.maxDistance = 85;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.55;
      controls.target.copy(DEFAULT_CAM_TARGET);
      controls.update();
    }

    // ==========================================
    // ÁNH SÁNG ẤM ÁP & HUYỀN ẢO TỎA TỪ BÊN TRONG CÂY
    // ==========================================
    const ambientLight = new THREE.AmbientLight(0x2a103d, 1.4);
    scene.add(ambientLight);

    const treeLight = new THREE.PointLight(0xff77aa, 3.2, 50);
    treeLight.position.set(0, 8, 0);
    scene.add(treeLight);

    const treeTopLight = new THREE.PointLight(0xffe0c0, 2.6, 40);
    treeTopLight.position.set(0, 10.5, 0);
    scene.add(treeTopLight);

    const warmLight = new THREE.PointLight(0xffaa33, 2.2, 35);
    warmLight.position.set(0, -2, 0);
    scene.add(warmLight);

    const moonDirLight = new THREE.DirectionalLight(0xfff5e6, 1.3);
    moonDirLight.position.set(12, 28, 18);
    scene.add(moonDirLight);

    // ==========================================
    // 1. ĐẢO BAY NGHỆ THUẬT (SCULPTED FLOATING ISLAND)
    // ==========================================
    const islandGroup = new THREE.Group();
    scene.add(islandGroup);

    const islandGeo = new THREE.CylinderGeometry(8.5, 2.2, 7.5, isMobile ? 32 : 48, 12);
    const posAttr = islandGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vy = posAttr.getY(i);
      const vz = posAttr.getZ(i);

      const distFromCenter = Math.sqrt(vx * vx + vz * vz);
      const noise =
        Math.sin(vx * 0.8) * Math.cos(vz * 0.8) * 0.6 +
        Math.sin(vx * 1.8 + vz * 1.5) * 0.3;

      if (vy > 0) {
        posAttr.setY(i, vy + noise * (1.0 - distFromCenter / 12));
      } else {
        posAttr.setX(i, vx + (Math.random() - 0.5) * 1.4);
        posAttr.setZ(i, vz + (Math.random() - 0.5) * 1.4);
      }
    }
    islandGeo.computeVertexNormals();

    const islandMat = new THREE.MeshStandardMaterial({
      color: 0x3d231b,
      roughness: 0.85,
      flatShading: true,
    });
    const islandMesh = new THREE.Mesh(islandGeo, islandMat);
    islandGroup.add(islandMesh);

    const topGeo = new THREE.CylinderGeometry(8.6, 7.8, 0.8, isMobile ? 32 : 48, 4);
    const topPos = topGeo.attributes.position;
    for (let i = 0; i < topPos.count; i++) {
      const vx = topPos.getX(i);
      const vy = topPos.getY(i);
      const vz = topPos.getZ(i);
      const noise = Math.sin(vx * 0.9) * Math.cos(vz * 0.9) * 0.5;
      topPos.setY(i, vy + noise * 0.4);
    }
    topGeo.computeVertexNormals();
    const topMat = new THREE.MeshStandardMaterial({
      color: 0x22130e,
      roughness: 0.9,
      flatShading: true,
    });
    const topMesh = new THREE.Mesh(topGeo, topMat);
    topMesh.position.y = 3.6;
    islandGroup.add(topMesh);

    // BỆ ĐÁ TRUNG TÂM & CÁC TẢNG ĐÁ NHỎ
    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0x4a4d52,
      roughness: 0.85,
      metalness: 0.1,
      flatShading: true,
    });

    const mainStonePlatformGeo = new THREE.CylinderGeometry(2.5, 3.0, 0.15, 6);
    const mainStonePlatform = new THREE.Mesh(mainStonePlatformGeo, stoneMat);
    mainStonePlatform.position.set(0, 3.9, 0);
    islandGroup.add(mainStonePlatform);

    for (let i = 0; i < 4; i++) {
      const rockGeo = new THREE.DodecahedronGeometry(0.2 + Math.random() * 0.25, 0);
      const rockMesh = new THREE.Mesh(rockGeo, stoneMat);
      const angle = (i / 4) * Math.PI * 2 + 0.5;
      const dist = 3.8 + Math.random() * 2.0;
      rockMesh.position.set(Math.cos(angle) * dist, 3.9, Math.sin(angle) * dist);
      rockMesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      islandGroup.add(rockMesh);
    }

    // ==========================================
    // 2. THÂN CÂY VÀ 14 CÀNH UỐN LƯỢN HỮU CƠ (TREE TRUNK & BRANCHES)
    // ==========================================
    const treeGroup = new THREE.Group();
    treeGroup.position.set(0, 4.0, 0);
    islandGroup.add(treeGroup);

    const trunkMat = new THREE.MeshStandardMaterial({
      color: 0x2b140e,
      roughness: 0.85,
    });

    const trunkCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.15, 2.5, -0.1),
      new THREE.Vector3(-0.1, 5.0, 0.1),
      new THREE.Vector3(0.0, 7.5, 0.0),
    ]);

    const trunkGeo = new THREE.TubeGeometry(trunkCurve, 32, 0.30, 8, false);
    const trunkMesh = new THREE.Mesh(trunkGeo, trunkMat);
    treeGroup.add(trunkMesh);

    const branchClusters = [];
    const mainBranchCount = 14;
    for (let i = 0; i < mainBranchCount; i++) {
      const angle = (i / mainBranchCount) * Math.PI * 2 + Math.random() * 0.3;
      const h = 2.8 + Math.random() * 4.2;
      const startP = trunkCurve.getPointAt(h / 7.5);
      const len = 3.2 + Math.random() * 2.4;

      const endP = new THREE.Vector3(
        startP.x + Math.cos(angle) * len,
        startP.y + 0.8 + Math.random() * 1.2,
        startP.z + Math.sin(angle) * len,
      );

      const midP = new THREE.Vector3().addVectors(startP, endP).multiplyScalar(0.5);
      midP.y += 0.45;

      const bCurve = new THREE.CatmullRomCurve3([startP, midP, endP]);
      const bGeo = new THREE.TubeGeometry(bCurve, 12, 0.10, 6, false);
      const bMesh = new THREE.Mesh(bGeo, trunkMat);
      treeGroup.add(bMesh);

      branchClusters.push({ center: endP, radius: 3.5 + Math.random() * 1.2 });
    }

    // ==========================================
    // 3. TÁN HOA ANH ĐÀO BỒNG BỀNH & LÁ CÂY PHÁT SÁNG RỰC RỠ
    // (LỚP TÁN MÂY DÀY + LỚP LÁ PHÁT QUANG ADDITIVE BLENDING LUNG LINH)
    // ==========================================
    const clusters = [
      { center: new THREE.Vector3(0, 10.2, 0), radius: 6.8 },
      { center: new THREE.Vector3(0, 8.0, 0), radius: 7.6 },
      { center: new THREE.Vector3(0, 5.8, 0), radius: 6.8 },
      { center: new THREE.Vector3(1.6, 7.5, 1.2), radius: 5.2 },
      { center: new THREE.Vector3(-1.5, 7.8, -1.2), radius: 5.2 },
      { center: new THREE.Vector3(-1.2, 8.2, 1.5), radius: 5.0 },
      { center: new THREE.Vector3(1.3, 8.0, -1.5), radius: 5.0 },
      ...branchClusters,
    ];

    // Texture 1: Hạt hoa mịn màng cho lớp nền
    function createParticleTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255,255,255,0.95)');
      grad.addColorStop(0.4, 'rgba(240,182,188,0.7)');
      grad.addColorStop(1, 'rgba(240,182,188,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(16, 16, 16, 0, Math.PI * 2);
      ctx.fill();
      return new THREE.CanvasTexture(canvas);
    }
    const particleTex = createParticleTexture();

    // Texture 2: Quầng sáng phát quang sắc nét cho lớp lá phát sáng
    function createGlowBlossomTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.2, 'rgba(255, 220, 240, 0.95)');
      grad.addColorStop(0.45, 'rgba(255, 110, 180, 0.65)');
      grad.addColorStop(0.75, 'rgba(255, 60, 140, 0.2)');
      grad.addColorStop(1, 'rgba(255, 60, 140, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
      const tex = new THREE.CanvasTexture(canvas);
      tex.generateMipmaps = false;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      return tex;
    }
    const glowBlossomTex = createGlowBlossomTexture();

    // A. Lớp 1: Khối tán hoa nền đầy đặn (Normal Blending)
    const baseParticleCount = isMobile ? 18000 : 28000;
    const blossomGeo = new THREE.BufferGeometry();
    const blossomPos = new Float32Array(baseParticleCount * 3);
    const blossomColors = new Float32Array(baseParticleCount * 3);

    const colorDustyPink = new THREE.Color(0xe8a2a8);
    const colorSoftPink = new THREE.Color(0xf0b6bc);
    const colorPaleRose = new THREE.Color(0xf7d1d5);
    const colorSoftWhite = new THREE.Color(0xfdf0f2);

    for (let i = 0; i < baseParticleCount; i++) {
      const c = clusters[Math.floor(Math.random() * clusters.length)];
      const u = Math.random();
      const r = Math.pow(u, 0.65) * c.radius;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      const x = c.center.x + r * Math.sin(phi) * Math.cos(theta);
      const y = c.center.y + r * Math.sin(phi) * Math.sin(theta) * 0.82;
      const z = c.center.z + r * Math.cos(phi);

      blossomPos[i * 3] = x;
      blossomPos[i * 3 + 1] = y;
      blossomPos[i * 3 + 2] = z;

      const heightFactor = THREE.MathUtils.clamp((y - 3) / 7.5, 0, 1);
      const randC = Math.random();
      let col;
      if (heightFactor < 0.3) {
        col = randC < 0.6 ? colorDustyPink : colorSoftPink;
      } else if (heightFactor < 0.7) {
        col = randC < 0.4 ? colorSoftPink : (randC < 0.8 ? colorPaleRose : colorDustyPink);
      } else {
        col = randC < 0.5 ? colorSoftWhite : colorPaleRose;
      }

      blossomColors[i * 3] = col.r;
      blossomColors[i * 3 + 1] = col.g;
      blossomColors[i * 3 + 2] = col.b;
    }
    blossomGeo.setAttribute('position', new THREE.BufferAttribute(blossomPos, 3));
    blossomGeo.setAttribute('color', new THREE.BufferAttribute(blossomColors, 3));

    const blossomMat = new THREE.PointsMaterial({
      size: isMobile ? 0.46 : 0.42,
      vertexColors: true,
      map: particleTex,
      transparent: true,
      opacity: 0.85,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });
    const blossomParticles = new THREE.Points(blossomGeo, blossomMat);
    treeGroup.add(blossomParticles);

    // B. Lớp 2: LÁ CÂY PHÁT SÁNG RỰC RỠ (ADDITIVE BLENDING LUMINOUS LEAVES)
    const glowParticleCount = isMobile ? 18000 : 28000;
    const glowGeo = new THREE.BufferGeometry();
    const glowPos = new Float32Array(glowParticleCount * 3);
    const glowColors = new Float32Array(glowParticleCount * 3);

    const cRadiantWhite = new THREE.Color(0xffffff);
    const cLuminousSakura = new THREE.Color(0xff5599);
    const cMoonlightGold = new THREE.Color(0xffe680);
    const cElectricRose = new THREE.Color(0xff2a7a);

    for (let i = 0; i < glowParticleCount; i++) {
      const c = clusters[Math.floor(Math.random() * clusters.length)];
      const u = Math.random();
      const r = Math.pow(u, 0.68) * (c.radius * 1.05);
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      const x = c.center.x + r * Math.sin(phi) * Math.cos(theta);
      const y = c.center.y + r * Math.sin(phi) * Math.sin(theta) * 0.85;
      const z = c.center.z + r * Math.cos(phi);

      glowPos[i * 3] = x;
      glowPos[i * 3 + 1] = y;
      glowPos[i * 3 + 2] = z;

      const pR = Math.random();
      let gCol;
      if (pR > 0.65) gCol = cRadiantWhite;
      else if (pR > 0.35) gCol = cLuminousSakura;
      else if (pR > 0.15) gCol = cMoonlightGold;
      else gCol = cElectricRose;

      glowColors[i * 3] = gCol.r;
      glowColors[i * 3 + 1] = gCol.g;
      glowColors[i * 3 + 2] = gCol.b;
    }
    glowGeo.setAttribute('position', new THREE.BufferAttribute(glowPos, 3));
    glowGeo.setAttribute('color', new THREE.BufferAttribute(glowColors, 3));

    const glowMat = new THREE.PointsMaterial({
      size: isMobile ? 0.55 : 0.50,
      vertexColors: true,
      map: glowBlossomTex,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const glowingLeavesParticles = new THREE.Points(glowGeo, glowMat);
    treeGroup.add(glowingLeavesParticles);

    // C. Lớp 3: BỤI TIÊN & ĐOM ĐÓM PHÁT SÁNG LƠ LỬNG QUANH TÁN CÂY (FAIRY DUST)
    const fairyCount = isMobile ? 120 : 200;
    const fairyGeo = new THREE.BufferGeometry();
    const fairyPos = new Float32Array(fairyCount * 3);
    const fairyData = [];
    for (let i = 0; i < fairyCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const rad = 2.0 + Math.random() * 8.5;
      const y = 4.5 + Math.random() * 8.5;
      fairyPos[i * 3] = Math.cos(angle) * rad;
      fairyPos[i * 3 + 1] = y;
      fairyPos[i * 3 + 2] = Math.sin(angle) * rad;
      fairyData.push({
        baseAngle: angle,
        orbitRad: rad,
        baseY: y,
        speed: 0.2 + Math.random() * 0.4,
        pulseSpeed: 1.5 + Math.random() * 2.0,
        phase: Math.random() * Math.PI * 2,
      });
    }
    fairyGeo.setAttribute('position', new THREE.BufferAttribute(fairyPos, 3));
    const fairyMat = new THREE.PointsMaterial({
      size: isMobile ? 0.38 : 0.32,
      color: 0xffe875,
      transparent: true,
      opacity: 0.9,
      map: glowBlossomTex,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const fairyParticles = new THREE.Points(fairyGeo, fairyMat);
    treeGroup.add(fairyParticles);

    // ==========================================
    // 4. ĐÀN THỎ NGỌC NHẢY NHÓT QUANH GỐC CÂY (RABBITS CIRCLING TREE)
    // ==========================================
    function createRabbit() {
      const group = new THREE.Group();
      const rabbitMat = new THREE.MeshStandardMaterial({
        color: 0xf8f8ff,
        roughness: 0.5,
      });

      const bodyGeo = new THREE.SphereGeometry(0.5, 12, 12);
      bodyGeo.scale(0.8, 1, 0.9);
      const bodyMesh = new THREE.Mesh(bodyGeo, rabbitMat);
      bodyMesh.position.y = 0.4;
      group.add(bodyMesh);

      const headGeo = new THREE.SphereGeometry(0.35, 12, 12);
      const headMesh = new THREE.Mesh(headGeo, rabbitMat);
      headMesh.position.set(0, 0.85, 0.2);
      group.add(headMesh);

      const earGeo = new THREE.CylinderGeometry(0.04, 0.08, 0.5, 8);
      const earLeft = new THREE.Mesh(earGeo, rabbitMat);
      earLeft.position.set(-0.12, 1.25, 0.18);
      earLeft.rotation.z = 0.15;
      earLeft.rotation.x = -0.1;
      group.add(earLeft);

      const earRight = earLeft.clone();
      earRight.position.x = 0.12;
      earRight.rotation.z = -0.15;
      group.add(earRight);

      // Hitbox chạm vào thỏ
      const hitBox = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 8), new THREE.MeshBasicMaterial({ visible: false }));
      hitBox.position.y = 0.7;
      group.add(hitBox);

      return { group, hitBox };
    }

    const rabbits = [];
    const rabbitHitboxes = [];
    for (let i = 0; i < 4; i++) {
      const { group: rabbitMesh, hitBox } = createRabbit();
      islandGroup.add(rabbitMesh);

      const rabbitData = {
        mesh: rabbitMesh,
        orbitRadius: 2.2 + i * 0.7, // 2.2, 2.9, 3.6, 4.3 -> Đi quanh gốc cây hoàn hảo!
        orbitSpeed: (0.13 + Math.random() * 0.12) * (i % 2 === 0 ? 1 : -1),
        phase: (i / 4) * Math.PI * 2,
        baseY: 4.05,
        hopSpeed: 4.5 + Math.random() * 2.0,
        hopHeight: 0.16,
        scale: 0.75 + Math.random() * 0.25,
        surpriseJump: 0,
      };
      rabbitMesh.scale.setScalar(rabbitData.scale);
      hitBox.userData = { isRabbit: true, rabbitData: rabbitData };
      rabbitHitboxes.push(hitBox);
      rabbits.push(rabbitData);
    }

    function updateRabbits(time) {
      rabbits.forEach((r) => {
        const angle = r.phase + time * r.orbitSpeed;
        const sign = Math.sign(r.orbitSpeed) || 1;

        const x = Math.cos(angle) * r.orbitRadius;
        const z = Math.sin(angle) * r.orbitRadius;
        let hop = Math.abs(Math.sin(time * r.hopSpeed)) * r.hopHeight;
        if (r.surpriseJump > 0) {
          hop += r.surpriseJump;
          r.surpriseJump = Math.max(0, r.surpriseJump - 0.04);
        }

        r.mesh.position.set(x, r.baseY + hop, z);

        const dx = -Math.sin(angle) * sign;
        const dz = Math.cos(angle) * sign;
        r.mesh.rotation.y = Math.atan2(dx, dz);
      });
    }

    // ==========================================
    // 5. ĐÈN LỒNG TRUNG THU PHÁT SÁNG & BAY LƠ LỬNG (LANTERNS)
    // ==========================================
    const lanternsGroup = new THREE.Group();
    scene.add(lanternsGroup);

    const lanterns = [];
    const interactiveLanternHitboxes = [];

    function createLanternTexture() {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createLinearGradient(0, 0, 0, 128);
      grad.addColorStop(0, '#ff4d4d');
      grad.addColorStop(0.5, '#e63946');
      grad.addColorStop(1, '#ffb703');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 6;
      ctx.strokeRect(4, 4, 120, 120);
      return new THREE.CanvasTexture(canvas);
    }

    const lanternTex = createLanternTexture();

    function createLanternMesh(index) {
      const group = new THREE.Group();

      const bodyGeo = new THREE.CylinderGeometry(0.65, 0.5, 1.45, 6);
      const bodyMat = new THREE.MeshStandardMaterial({
        map: lanternTex,
        emissive: 0xff7700,
        emissiveIntensity: 0.75,
        roughness: 0.3,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      group.add(body);

      const capGeo = new THREE.CylinderGeometry(0.68, 0.68, 0.1, 6);
      const capMat = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        metalness: 0.5,
      });
      const capTop = new THREE.Mesh(capGeo, capMat);
      capTop.position.y = 0.72;
      group.add(capTop);

      const tagGeo = new THREE.PlaneGeometry(0.35, 0.7);
      const tagMat = new THREE.MeshBasicMaterial({
        color: 0xd90429,
        side: THREE.DoubleSide,
      });
      const tag = new THREE.Mesh(tagGeo, tagMat);
      tag.position.set(0, -1.15, 0);
      group.add(tag);

      const spriteMat = new THREE.SpriteMaterial({
        map: particleTex,
        color: 0xffaa00,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
      });
      const glow = new THREE.Sprite(spriteMat);
      glow.scale.set(3.5, 3.5, 1);
      group.add(glow);

      const hitGeo = new THREE.SphereGeometry(2.0, 8, 8);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.userData = { isLantern: true, lanternIndex: index, parentLantern: group };
      group.add(hitMesh);

      return { group, hitMesh };
    }

    // 8 Đèn lồng chính gắn liền với 8 câu ca dao & tranh ảnh Trung Thu + đèn phụ bay tự do
    const totalLanternCount = isMobile ? 20 : 28;
    for (let i = 0; i < totalLanternCount; i++) {
      const { group: lantern, hitMesh } = createLanternMesh(i % lanternStories.length);

      const radius = 10.5 + Math.random() * 20;
      const angle = (i / totalLanternCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const y = -1 + Math.random() * 26;

      lantern.position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);

      lantern.userData = {
        speedY: 0.008 + Math.random() * 0.012,
        swingSpeed: 0.8 + Math.random() * 1.2,
        initialX: lantern.position.x,
        initialZ: lantern.position.z,
        index: i % lanternStories.length,
        id: i,
      };

      const sc = 0.8 + Math.random() * 0.45;
      lantern.scale.set(sc, sc, sc);

      lanternsGroup.add(lantern);
      lanterns.push(lantern);
      interactiveLanternHitboxes.push(hitMesh);
    }

    // ==========================================
    // 6. CÁNH HOA ĐÀO RƠI, SAO ĐÊM & PHÁO HOA
    // ==========================================
    const fallingPetalsCount = isMobile ? 80 : 160;
    const petalsGeo = new THREE.BufferGeometry();
    const petalsPos = new Float32Array(fallingPetalsCount * 3);
    const petalsData = [];

    for (let i = 0; i < fallingPetalsCount; i++) {
      petalsPos[i * 3] = (Math.random() - 0.5) * 36;
      petalsPos[i * 3 + 1] = Math.random() * 36;
      petalsPos[i * 3 + 2] = (Math.random() - 0.5) * 36;

      petalsData.push({
        speedY: 0.02 + Math.random() * 0.03,
      });
    }

    petalsGeo.setAttribute('position', new THREE.BufferAttribute(petalsPos, 3));
    const petalsMat = new THREE.PointsMaterial({
      size: isMobile ? 0.35 : 0.3,
      color: 0xf7d1d5,
      transparent: true,
      opacity: 0.75,
      map: particleTex,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });
    const petalsParticles = new THREE.Points(petalsGeo, petalsMat);
    scene.add(petalsParticles);

    // Ngôi sao đêm lấp lánh
    const starCount = isMobile ? 400 : 800;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 180;
      starPos[i * 3 + 1] = Math.random() * 90;
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 180;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.4,
      transparent: true,
      opacity: 0.7,
    });
    scene.add(new THREE.Points(starGeo, starMat));

    // Hiệu ứng pháo hoa khi bấm trúng đèn lồng
    let fireworks = [];
    function createFirework(pos) {
      const pCount = 50;
      const pGeo = new THREE.BufferGeometry();
      const pPositions = new Float32Array(pCount * 3);
      const velocities = [];

      for (let i = 0; i < pCount; i++) {
        pPositions[i * 3] = pos.x;
        pPositions[i * 3 + 1] = pos.y;
        pPositions[i * 3 + 2] = pos.z;

        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const speed = 0.08 + Math.random() * 0.12;

        velocities.push(
          new THREE.Vector3(
            speed * Math.sin(phi) * Math.cos(theta),
            speed * Math.sin(phi) * Math.sin(theta),
            speed * Math.cos(phi),
          ),
        );
      }

      pGeo.setAttribute('position', new THREE.BufferAttribute(pPositions, 3));
      const pMat = new THREE.PointsMaterial({
        size: 0.35,
        color: 0xffd700,
        transparent: true,
        opacity: 1,
        blending: THREE.AdditiveBlending,
      });

      const pMesh = new THREE.Points(pGeo, pMat);
      scene.add(pMesh);

      fireworks.push({ mesh: pMesh, velocities: velocities, life: 1.0 });
    }

    // ==========================================
    // 7. RAYCASTING, CLICK & ZOOM TO LANTERN
    // ==========================================
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };
    let pointerDownTime = 0;

    treeViewport.addEventListener('pointerdown', (e) => {
      pointerDownPos.x = e.clientX;
      pointerDownPos.y = e.clientY;
      pointerDownTime = Date.now();
    });

    treeViewport.addEventListener('pointerup', (e) => {
      const distMoved = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      const duration = Date.now() - pointerDownTime;

      // Nhấp chuột hoặc chạm tay hợp lệ (< 10px và < 450ms)
      if (distMoved < 10 && duration < 450) {
        const rect = treeViewport.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        // 1. Kiểm tra bấm trúng đèn lồng
        const lanternHits = raycaster.intersectObjects(interactiveLanternHitboxes, false);
        if (lanternHits.length > 0) {
          if (e.cancelable) e.preventDefault();
          const hitObj = lanternHits[0].object;
          const parentL = hitObj.userData.parentLantern;
          const lPos = parentL ? parentL.position : hitObj.position;
          const lIndex = hitObj.userData.lanternIndex || 0;

          // Bắn pháo hoa rực rỡ
          createFirework(lPos);

          // Camera nhẹ nhàng hướng về phía đèn lồng được chọn
          const offset = new THREE.Vector3()
            .subVectors(camera.position, lPos)
            .normalize()
            .multiplyScalar(6.0);
          targetCamPos = new THREE.Vector3().addVectors(lPos, offset);
          targetCamTarget = lPos.clone();

          // HIỆN POPUP NGAY LẬP TỨC TRÊN MÀN HÌNH (KHÔNG CHỜ, KHÔNG LƯỚT ĐI ĐÂU)
          openLanternModal(lIndex);
          return;
        }

        // 2. Kiểm tra chạm vào Thỏ Ngọc dưới gốc cây
        const rabbitHits = raycaster.intersectObjects(rabbitHitboxes, false);
        if (rabbitHits.length > 0) {
          const hitRabbit = rabbitHits[0].object;
          const rData = hitRabbit.userData.rabbitData;
          if (rData) {
            rData.surpriseJump = 1.35;
            playChime(783.99, 'sine', 0.5, 0.08);
            createMiniHeartBurst(e.clientX, e.clientY, 15);
          }
        }
      }
    });

    function resetCamera() {
      targetCamPos = DEFAULT_CAM_POS.clone();
      targetCamTarget = DEFAULT_CAM_TARGET.clone();
    }

    if (reset3DViewBtn) {
      reset3DViewBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        resetCamera();
        playChime(659.25, 'sine', 0.4, 0.05);
      });
    }

    // Đóng popup thì camera lùi lại góc nhìn bao quát ban đầu
    const originalCloseLanternModal = closeLanternModal;
    closeLanternModal = function() {
      originalCloseLanternModal();
      resetCamera();
    };

    // ==========================================
    // 8. VÒNG LẶP HOẠT ẢNH 3D (ANIMATION LOOP 60 FPS)
    // ==========================================
    const clock = new THREE.Clock();

    function animate3D() {
      requestAnimationFrame(animate3D);

      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Đảo đá bồng bềnh êm ả
      islandGroup.rotation.y = Math.sin(time * 0.15) * 0.05;

      // Cập nhật bước nhảy tự do của đàn thỏ ngọc
      updateRabbits(time);

      // Đèn lồng bay lên cao và đung đưa trong gió đêm
      lanterns.forEach((lantern) => {
        lantern.position.y += lantern.userData.speedY;
        lantern.position.x =
          lantern.userData.initialX +
          Math.sin(time * lantern.userData.swingSpeed + lantern.userData.id) * 0.4;
        lantern.position.z =
          lantern.userData.initialZ +
          Math.cos(time * lantern.userData.swingSpeed + lantern.userData.id) * 0.4;
        lantern.rotation.y += 0.005;

        if (lantern.position.y > 30) {
          lantern.position.y = -3;
        }
      });

      // Cánh hoa đào bay lượn
      const pPos = petalsGeo.attributes.position.array;
      for (let i = 0; i < fallingPetalsCount; i++) {
        pPos[i * 3 + 1] -= petalsData[i].speedY;
        pPos[i * 3] += Math.sin(time + i) * 0.01;
        pPos[i * 3 + 2] += Math.cos(time + i) * 0.01;

        if (pPos[i * 3 + 1] < -3) {
          pPos[i * 3 + 1] = 30;
          pPos[i * 3] = (Math.random() - 0.5) * 36;
          pPos[i * 3 + 2] = (Math.random() - 0.5) * 36;
        }
      }
      petalsGeo.attributes.position.needsUpdate = true;

      // Hiệu ứng pháo hoa
      for (let i = fireworks.length - 1; i >= 0; i--) {
        const fw = fireworks[i];
        fw.life -= delta * 1.2;
        const posArr = fw.mesh.geometry.attributes.position.array;

        for (let j = 0; j < fw.velocities.length; j++) {
          posArr[j * 3] += fw.velocities[j].x;
          posArr[j * 3 + 1] += fw.velocities[j].y;
          posArr[j * 3 + 2] += fw.velocities[j].z;
        }
        fw.mesh.geometry.attributes.position.needsUpdate = true;
        fw.mesh.material.opacity = Math.max(0, fw.life);

        if (fw.life <= 0) {
          scene.remove(fw.mesh);
          fireworks.splice(i, 1);
        }
      }

      // Tán hoa và lá cây phát sáng khẽ đung đưa êm dịu theo làn gió đêm
      blossomParticles.rotation.y = Math.sin(time * 0.35) * 0.02;
      glowingLeavesParticles.rotation.y = Math.sin(time * 0.35) * 0.02;
      glowingLeavesParticles.rotation.z = Math.cos(time * 0.25) * 0.01;

      // Hoạt ảnh bụi tiên bay lượn quanh tán lá
      const fairyArr = fairyGeo.attributes.position.array;
      for (let fi = 0; fi < fairyCount; fi++) {
        const fd = fairyData[fi];
        const curAngle = fd.baseAngle + time * fd.speed * 0.3;
        fairyArr[fi * 3] = Math.cos(curAngle) * (fd.orbitRad + Math.sin(time + fd.phase) * 0.4);
        fairyArr[fi * 3 + 1] = fd.baseY + Math.sin(time * fd.pulseSpeed + fd.phase) * 0.35;
        fairyArr[fi * 3 + 2] = Math.sin(curAngle) * (fd.orbitRad + Math.cos(time + fd.phase) * 0.4);
      }
      fairyGeo.attributes.position.needsUpdate = true;

      // Ánh sáng phát ra từ bên trong tán cây thở nhịp nhàng
      treeLight.intensity = 3.4 + Math.sin(time * 2.2) * 0.8;
      treeTopLight.intensity = 2.8 + Math.cos(time * 1.8) * 0.6;

      // Di chuyển camera mượt mà khi zoom hoặc reset
      if (targetCamPos && targetCamTarget) {
        camera.position.lerp(targetCamPos, 0.045);
        if (controls) {
          controls.target.lerp(targetCamTarget, 0.045);
        } else {
          camera.lookAt(targetCamTarget);
        }

        if (camera.position.distanceTo(targetCamPos) < 0.15) {
          targetCamPos = null;
          targetCamTarget = null;
        }
      }

      if (controls) {
        controls.update();
      }

      renderer.render(scene, camera);
    }
    animate3D();

    window.addEventListener('resize', () => {
      if (treeViewport) {
        const nw = treeViewport.clientWidth;
        const nh = treeViewport.clientHeight;
        camera.aspect = nw / nh;
        camera.fov = window.innerWidth < 768 ? 55 : 45;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, nh);
      }
    });
  }

});


