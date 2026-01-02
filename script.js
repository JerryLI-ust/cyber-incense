document.addEventListener('DOMContentLoaded', function() {
    // 状态变量
    let burnTime = 0;
    let prayerCount = 0;
    let burnInterval;
    let incenseLit = [false, false, false]; // 修改：初始全部未点燃
    let incenseColor = '#ff6b35';
    let activeIncense = null;

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

    // 点击香也可以点燃/熄灭
    incenseSticks.forEach((stick, index) => {
        stick.addEventListener('click', function() {
            if (!incenseLit[index]) {
                lightIncense(stick, index);
            } else {
                extinguishIncense(stick, index);
            }
        });
    });

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
        startBurnTimer();
    }

    // 点燃单支香
    function lightSingleIncense() {
        let found = false;
        for (let i = 0; i < incenseLit.length; i++) {
            if (!incenseLit[i]) {
                const stick = incenseSticks[i];
                lightIncense(stick, i);
                incenseLit[i] = true;
                activeIncense = i;
                found = true;
                
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
        if (!found) {
            logMessage('系统', '所有香都已点燃');
        }
        startBurnTimer();
    }

    // 点燃单支香的具体逻辑 - 修复版
    function lightIncense(stick, index) {
        // 播放音效
        lightSound.currentTime = 0;
        lightSound.play();

        // 点燃香头
        const tip = stick.querySelector('.tip');
        tip.style.background = `linear-gradient(to bottom, ${incenseColor}, #ff4500)`;
        tip.classList.add('active');

        // 创建香灰
        if (!stick.querySelector('.ash')) {
            const ash = document.createElement('div');
            ash.className = 'ash';
            stick.appendChild(ash);
        }

        // 开始香灰增长
        startAshAnimation(stick);

        // 开始烟雾动画
        const smoke = stick.querySelector('.smoke');
        startSmokeAnimation(smoke, index);

        // 更新颜色
        updateAllIncenseColors();

        // 记录活动香
        activeIncense = index;
    }

    // 熄灭香
    function extinguishIncense(stick, index) {
        const tip = stick.querySelector('.tip');
        const smoke = stick.querySelector('.smoke');
        const ash = stick.querySelector('.ash');
        
        tip.classList.remove('active');
        smoke.style.opacity = '0';
        smoke.style.animation = 'none';
        
        if (ash) {
            ash.classList.remove('active');
            ash.style.animation = 'none';
        }
        
        incenseLit[index] = false;
        
        // 停止计时如果所有香都灭了
        if (!incenseLit.some(lit => lit)) {
            clearInterval(burnInterval);
            incenseStatus.textContent = '香火已灭';
            logMessage('系统', '所有香火已熄灭');
        } else {
            logMessage('系统', `第${index + 1}支香已熄灭`);
        }
    }

    // 开始香灰增长动画
    function startAshAnimation(stick) {
        const ash = stick.querySelector('.ash');
        if (!ash) return;
        
        ash.classList.add('active');
        let ashHeight = 0;
        const ashInterval = setInterval(() => {
            if (ashHeight < 40) {
                ashHeight += 0.2;
                ash.style.height = `${ashHeight}px`;
                ash.style.top = `-${ashHeight}px`;
            } else {
                clearInterval(ashInterval);
            }
        }, 1000);
    }

    // 开始烟雾动画 - 优化版
    function startSmokeAnimation(smoke, index) {
        smoke.style.opacity = '0.8';
        smoke.style.animation = `smokeRise 4s infinite ease-out`;
        
        // 清理旧的粒子
        const oldParticles = smoke.querySelectorAll('.smoke-particle');
        oldParticles.forEach(p => p.remove());
        
        // 创建新的烟雾粒子
        createSmokeParticles(smoke, index);
    }

    // 创建烟雾粒子效果 - 优化版
    function createSmokeParticles(smoke, incenseIndex) {
        const smokeCount = parseInt(smokeAmount.value) * 2;
        const colors = [
            'rgba(255, 255, 255, 0.15)',
            'rgba(255, 255, 230, 0.12)',
            'rgba(255, 240, 200, 0.1)',
            'rgba(220, 220, 255, 0.08)'
        ];
        
        for (let i = 0; i < smokeCount; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'smoke-particle';
                
                const size = Math.random() * 60 + 30;
                const color = colors[Math.floor(Math.random() * colors.length)];
                const delay = Math.random() * 2;
                const duration = Math.random() * 3 + 3;
                
                particle.style.cssText = `
                    width: ${size}px;
                    height: ${size}px;
                    background: radial-gradient(circle, 
                        ${color} 0%,
                        rgba(255, 255, 255, 0.03) 50%,
                        transparent 70%);
                    left: ${Math.random() * 120 - 60}px;
                    top: ${Math.random() * 50}px;
                    opacity: ${Math.random() * 0.3 + 0.1};
                    filter: blur(${Math.random() * 10 + 8}px);
                    animation: smokeFloat ${duration}s ${delay}s infinite ease-out;
                `;
                
                smoke.appendChild(particle);
                
                // 自动清理
                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.remove();
                    }
                }, (duration + delay) * 1000);
            }, i * 200);
        }
    }

    // 更新所有香的颜色 - 修复版
    function updateAllIncenseColors() {
        document.querySelectorAll('.tip.active').forEach(tip => {
            tip.style.background = `linear-gradient(to bottom, ${incenseColor}, #ff4500)`;
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
        if (burnInterval) return;
        
        burnInterval = setInterval(() => {
            burnTime++;
            updateBurnTimeDisplay();
            
            // 每10秒生成一次灰烬
            if (burnTime % 10 === 0) {
                updateAshOnAllIncense();
            }
        }, 1000);
    }

    // 更新香灰
    function updateAshOnAllIncense() {
        incenseSticks.forEach((stick, index) => {
            if (incenseLit[index]) {
                const ash = stick.querySelector('.ash');
                if (ash) {
                    let currentHeight = parseFloat(ash.style.height) || 0;
                    if (currentHeight < 60) {
                        currentHeight += 1;
                        ash.style.height = `${currentHeight}px`;
                        ash.style.top = `-${currentHeight}px`;
                    }
                }
            }
        });
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
            const ash = stick.querySelector('.ash');
            
            tip.classList.remove('active');
            smoke.style.opacity = '0';
            smoke.style.animation = 'none';
            
            if (ash) {
                ash.classList.remove('active');
                ash.style.height = '2px';
                ash.style.top = '-2px';
            }
            
            incenseLit[index] = false;
        });
        
        clearInterval(burnInterval);
        burnInterval = null;
        burnTime = 0;
        updateBurnTimeDisplay();
        incenseStatus.textContent = '等待点燃';
        logMessage('系统', '香火已重置');
    }

    // 发送祈福 - 增强版
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
            
            // 记录到日志
            logMessage('祈福者', prayer);
            
            // 创建飘动的祈福文字
            createFloatingPrayer(prayer);
            
            // 清空输入框
            prayerText.value = '';
            
            // 添加视觉反馈
            const sendBtn = document.getElementById('sendPrayer');
            sendBtn.innerHTML = '<i class="fas fa-check"></i> 已发送';
            sendBtn.style.background = 'linear-gradient(45deg, #10b981, #059669)';
            
            setTimeout(() => {
                sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i> 发送祈福';
                sendBtn.style.background = 'linear-gradient(45deg, #6366f1, #8b5cf6)';
            }, 2000);
        } else {
            // 如果为空，随机发送一条默认祈福语
            const defaultPrayers = [
                "愿世界和平，众生安康",
                "祈求智慧增长，烦恼消除",
                "愿家人平安，幸福美满",
                "工作顺利，事业有成",
                "身体健康，心灵平静"
            ];
            const randomPrayer = defaultPrayers[Math.floor(Math.random() * defaultPrayers.length)];
            prayerText.value = randomPrayer;
            sendPrayer();
        }
    }

    // 创建飘动的祈福文字
    function createFloatingPrayer(prayer) {
        // 只在点燃的香旁边显示
        const activeSticks = Array.from(incenseSticks).filter((_, i) => incenseLit[i]);
        if (activeSticks.length === 0) return;
        
        // 选择一支点燃的香（优先选择当前活动的香）
        let targetStick;
        if (activeIncense !== null && incenseLit[activeIncense]) {
            targetStick = incenseSticks[activeIncense];
        } else {
            targetStick = activeSticks[Math.floor(Math.random() * activeSticks.length)];
        }
        
        // 获取香的位置
        const stickRect = targetStick.getBoundingClientRect();
        const container = document.querySelector('.altar');
        const containerRect = container.getBoundingClientRect();
        
        // 创建祈福气泡
        const bubble = document.createElement('div');
        bubble.className = 'prayer-bubble';
        bubble.textContent = prayer;
        
        // 随机位置
        const offsetX = Math.random() * 40 - 20;
        bubble.style.left = `${stickRect.left - containerRect.left + offsetX}px`;
        bubble.style.top = `${stickRect.top - containerRect.top - 40}px`;
        
        container.appendChild(bubble);
        
        // 10秒后移除
        setTimeout(() => {
            if (bubble.parentNode) {
                bubble.remove();
            }
        }, 10000);
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
        if (e.code === 'Space' && e.target === document.body) {
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
        // 1,2,3键点燃对应的香
        else if (e.code === 'Digit1' || e.code === 'Numpad1') {
            e.preventDefault();
            if (!incenseLit[0]) {
                lightIncense(incenseSticks[0], 0);
                incenseLit[0] = true;
                activeIncense = 0;
                startBurnTimer();
            }
        }
        else if (e.code === 'Digit2' || e.code === 'Numpad2') {
            e.preventDefault();
            if (!incenseLit[1]) {
                lightIncense(incenseSticks[1], 1);
                incenseLit[1] = true;
                activeIncense = 1;
                startBurnTimer();
            }
        }
        else if (e.code === 'Digit3' || e.code === 'Numpad3') {
            e.preventDefault();
            if (!incenseLit[2]) {
                lightIncense(incenseSticks[2], 2);
                incenseLit[2] = true;
                activeIncense = 2;
                startBurnTimer();
            }
        }
    });

    // 触摸设备支持
    incenseSticks.forEach((stick, index) => {
        stick.addEventListener('touchstart', function(e) {
            e.preventDefault();
            if (!incenseLit[index]) {
                lightIncense(stick, index);
                incenseLit[index] = true;
                startBurnTimer();
            } else {
                extinguishIncense(stick, index);
            }
        });
    });

    // 自动更新烟雾粒子
    setInterval(() => {
        document.querySelectorAll('.smoke').forEach((smoke, index) => {
            if (incenseLit[index] && Math.random() > 0.7) {
                createSmokeParticles(smoke, index);
            }
        });
    }, 3000);

    // 初始化消息
    logMessage('系统', '赛博烧香系统已启动，点击香或使用按钮开始');
    logMessage('系统', '快捷键：空格键点燃所有香，Ctrl+Enter发送祈福');
});
