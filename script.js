document.addEventListener('DOMContentLoaded', function() {
    // 状态变量
    let burnTime = 0;
    let prayerCount = 0;
    let burnInterval;
    let incenseLit = [true, false, false];
    let incenseColor = '#ff6b35';

    // 音频元素
    const lightSound = document.getElementById('lightSound');
    const ambientSound = document.getElementById('ambientSound');
    
    // 初始化环境音
    ambientSound.volume = 0.3;
    ambientSound.play();

    // DOM 元素
    const incenseSticks = document.querySelectorAll('.incense-stick');
    const smokeElements = document.querySelectorAll('.smoke');
    const prayerText = document.getElementById('prayerText');
    const incenseStatus = document.getElementById('incenseStatus');
    const burnTimeDisplay = document.getElementById('burnTime');
    const prayerCountDisplay = document.getElementById('prayerCount');
    const prayerList = document.getElementById('prayerList');
    const incenseColorSelect = document.getElementById('incenseColor');
    const smokeAmount = document.getElementById('smokeAmount');

    // 按钮事件监听
    document.getElementById('lightAll').addEventListener('click', lightAllIncense);
    document.getElementById('lightSingle').addEventListener('click', lightSingleIncense);
    document.getElementById('reset').addEventListener('click', resetIncense);
    document.getElementById('sendPrayer').addEventListener('click', sendPrayer);
    incenseColorSelect.addEventListener('change', updateIncenseColor);
    smokeAmount.addEventListener('input', updateSmokeDensity);

    // 点燃所有香
    function lightAllIncense() {
        incenseSticks.forEach((stick, index) => {
            if (!incenseLit[index]) {
                lightIncense(stick, index);
                incenseLit[index] = true;
            }
        });
        incenseStatus.textContent = '三香齐燃';
        logMessage('系统', '三支香已全部点燃');
    }

    // 点燃单支香
    function lightSingleIncense() {
        for (let i = 0; i < incenseLit.length; i++) {
            if (!incenseLit[i]) {
                const stick = incenseSticks[i];
                lightIncense(stick, i);
                incenseLit[i] = true;
                
                let statusText = '';
                switch(i) {
                    case 0: statusText = '天香已燃'; break;
                    case 1: statusText = '地香已燃'; break;
                    case 2: statusText = '人香已燃'; break;
                }
                incenseStatus.textContent = statusText;
                logMessage('系统', `${statusText}`);
                break;
            }
        }
    }

    // 点燃单支香的具体逻辑
    function lightIncense(stick, index) {
        // 播放音效
        lightSound.currentTime = 0;
        lightSound.play();

        // 点燃香头
        const tip = stick.querySelector('.tip');
        tip.style.backgroundColor = incenseColor;
        tip.classList.add('active');

        // 如果是第一支香，添加火花效果
        if (index === 0) {
            const sparkle = stick.querySelector('.sparkle');
            sparkle.style.opacity = '1';
            sparkle.style.animation = 'sparkle 0.5s infinite alternate';
        }

        // 开始烟雾动画
        const smoke = stick.querySelector('.smoke');
        startSmokeAnimation(smoke);

        // 如果是第一支点燃的香，开始计时
        if (!burnInterval && index === 0) {
            startBurnTimer();
        }

        // 更新颜色
        updateAllIncenseColors();
    }

    // 开始烟雾动画
    function startSmokeAnimation(smoke) {
        smoke.style.opacity = '0.8';
        smoke.style.animation = `smokeRise 3s infinite ease-out`;
        
        // 随机生成烟雾粒子
        createSmokeParticles(smoke);
    }

    // 创建烟雾粒子效果
    function createSmokeParticles(smoke) {
        const smokeCount = parseInt(smokeAmount.value);
        for (let i = 0; i < smokeCount; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'smoke-particle';
                particle.style.cssText = `
                    position: absolute;
                    width: ${Math.random() * 40 + 20}px;
                    height: ${Math.random() * 40 + 20}px;
                    background: radial-gradient(circle at center, 
                        rgba(255,255,255,0.1) 0%,
                        rgba(255,255,255,0.05) 20%,
                        transparent 70%);
                    border-radius: 50%;
                    top: ${Math.random() * 50}px;
                    left: ${Math.random() * 100 - 50}px;
                    opacity: ${Math.random() * 0.3 + 0.2};
                    filter: blur(${Math.random() * 15 + 5}px);
                    animation: smokeRise ${Math.random() * 2 + 2}s infinite ease-out;
                `;
                smoke.appendChild(particle);
                
                // 移除粒子
                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.parentNode.removeChild(particle);
                    }
                }, 3000);
            }, i * 300);
        }
    }

    // 更新所有香的颜色
    function updateAllIncenseColors() {
        document.querySelectorAll('.tip.active').forEach(tip => {
            tip.style.backgroundColor = incenseColor;
        });
    }

    // 更新香的颜色
    function updateIncenseColor() {
        incenseColor = incenseColorSelect.value;
        updateAllIncenseColors();
    }

    // 更新烟雾密度
    function updateSmokeDensity() {
        document.querySelectorAll('.smoke').forEach(smoke => {
            smoke.style.animationDuration = `${4 - (smokeAmount.value / 10) * 2}s`;
        });
    }

    // 开始烧香计时
    function startBurnTimer() {
        clearInterval(burnInterval);
        burnInterval = setInterval(() => {
            burnTime++;
            updateBurnTimeDisplay();
        }, 1000);
    }

    // 更新烧香时间显示
    function updateBurnTimeDisplay() {
        const hours = Math.floor(burnTime / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((burnTime % 3600) / 60).toString().padStart(2, '0');
        const seconds = (burnTime % 60).toString().padStart(2, '0');
        burnTimeDisplay.textContent = `${hours}:${minutes}:${seconds}`;
    }

    // 重置香火
    function resetIncense() {
        incenseSticks.forEach((stick, index) => {
            const tip = stick.querySelector('.tip');
            const smoke = stick.querySelector('.smoke');
            const sparkle = stick.querySelector('.sparkle');
            
            tip.classList.remove('active');
            smoke.style.opacity = '0';
            smoke.style.animation = 'none';
            
            if (sparkle) {
                sparkle.style.opacity = '0';
                sparkle.style.animation = 'none';
            }
            
            incenseLit[index] = false;
        });
        
        incenseLit[0] = true; // 保留第一支香为已点燃状态
        incenseSticks[0].querySelector('.tip').classList.add('active');
        incenseSticks[0].querySelector('.smoke').style.opacity = '0.8';
        startSmokeAnimation(incenseSticks[0].querySelector('.smoke'));
        
        clearInterval(burnInterval);
        burnTime = 0;
        updateBurnTimeDisplay();
        incenseStatus.textContent = '已重置';
        logMessage('系统', '香火已重置');
    }

    // 发送祈福
    function sendPrayer() {
        const prayer = prayerText.value.trim();
        if (prayer) {
            prayerCount++;
            prayerCountDisplay.textContent = prayerCount;
            
            const now = new Date();
            const timeStr = now.toLocaleTimeString('zh-CN', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit'
            });
            
            logMessage('祈福者', prayer);
            
            // 清空输入框
            prayerText.value = '';
            
            // 添加视觉反馈
            document.getElementById('sendPrayer').classList.add('active');
            setTimeout(() => {
                document.getElementById('sendPrayer').classList.remove('active');
            }, 300);
        }
    }

    // 记录消息
    function logMessage(sender, message) {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('zh-CN', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
        
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.innerHTML = `
            <span class="time">[${timeStr}] ${sender}:</span>
            <span class="message">${message}</span>
        `;
        
        prayerList.appendChild(logEntry);
        prayerList.scrollTop = prayerList.scrollHeight;
    }

    // 键盘快捷键
    document.addEventListener('keydown', function(e) {
        // 空格键点燃所有香
        if (e.code === 'Space') {
            e.preventDefault();
            lightAllIncense();
        }
        // 回车键发送祈福
        else if (e.code === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            sendPrayer();
        }
        // R键重置
        else if (e.code === 'KeyR' && e.ctrlKey) {
            e.preventDefault();
            resetIncense();
        }
    });

    // 触摸设备支持
    document.querySelectorAll('.incense-stick').forEach((stick, index) => {
        stick.addEventListener('touchstart', function(e) {
            e.preventDefault();
            if (!incenseLit[index]) {
                lightIncense(stick, index);
                incenseLit[index] = true;
                incenseStatus.textContent = `第${index + 1}支香已点燃`;
            }
        });
    });

    // 初始化：点燃第一支香
    setTimeout(() => {
        lightIncense(incenseSticks[0], 0);
        logMessage('系统', '欢迎来到赛博烧香！点击按钮开始您的数字修行之旅');
    }, 1000);
});