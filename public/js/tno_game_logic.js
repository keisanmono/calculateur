// js/tno_game_logic.js

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. 游戏状态 (Game State) ---
    const gameState = {
        currentDate: new Date(1962, 0, 1), // 年, 月(0-11), 日
        countryTag: "GER_PROTOTYPE",
        leader: "Generic Leader",
        politicalPower: 100,
        stability: 50, // 0-100
        flags: {}
    };

    // --- 2. UI 元素引用 ---
    // 确保在DOM完全加载后再获取元素
    const dateDisplay = document.getElementById('current-date-display');
    const ppDisplay = document.getElementById('current-pp-display');
    const stabilityDisplay = document.getElementById('current-stability-display');
    const advanceTimeBtn = document.getElementById('advance-time-btn');
    const advanceWeekBtn = document.getElementById('advance-week-btn');

    const eventPopup = document.getElementById('event-popup-test');
    const eventTitle = document.getElementById('event-title-test');
    const eventDescription = document.getElementById('event-description-test');
    const eventOptionsContainer = document.getElementById('event-options-test');
    const gameLog = document.getElementById('game-log');

    // --- 3. 更新UI的函数 ---
    function updateUI() {
        if (!dateDisplay || !ppDisplay || !stabilityDisplay) {
            console.error("UI elements for status bar not found!");
            return;
        }
        const year = gameState.currentDate.getFullYear();
        const month = String(gameState.currentDate.getMonth() + 1).padStart(2, '0'); // 月份是从0开始的
        const day = String(gameState.currentDate.getDate()).padStart(2, '0');
        dateDisplay.textContent = `${year}-${month}-${day}`;

        ppDisplay.textContent = gameState.politicalPower;
        stabilityDisplay.textContent = `${gameState.stability}%`;
    }

    // --- 4. 游戏日志函数 ---
    function logMessage(message) {
        if (!gameLog) {
            console.warn("Game log element not found. Skipping log message.");
            return;
        }
        const logEntry = document.createElement('p');
        const timeStamp = `${gameState.currentDate.getFullYear()}-${String(gameState.currentDate.getMonth() + 1).padStart(2, '0')}-${String(gameState.currentDate.getDate()).padStart(2, '0')}`;
        logEntry.textContent = `[${timeStamp}] ${message}`;

        if (gameLog.firstChild) {
            gameLog.insertBefore(logEntry, gameLog.firstChild);
        } else {
            gameLog.appendChild(logEntry);
        }
        console.log(`[LOG - ${timeStamp}] ${message}`);
    }

    // --- 5. 时间推进系统 ---
    let isTimeAdvancing = false; // 防止在时间推进时再次点击

    function advanceTime(days) {
        if (isTimeAdvancing) return; // 如果正在推进时间，则不执行
        isTimeAdvancing = true;

        if(advanceTimeBtn) advanceTimeBtn.disabled = true;
        if(advanceWeekBtn) advanceWeekBtn.disabled = true;

        let daysProcessed = 0;
        const processDay = () => {
            gameState.currentDate.setDate(gameState.currentDate.getDate() + 1);
            gameState.politicalPower += 1; 
            checkEvents();
            daysProcessed++;

            if (daysProcessed >= days) {
                updateUI();
                logMessage(`时间推进了 ${days} 天。`);
                if(advanceTimeBtn) advanceTimeBtn.disabled = false;
                if(advanceWeekBtn) advanceWeekBtn.disabled = false;
                isTimeAdvancing = false;
            } else {
                if (days > 1 && (daysProcessed % Math.max(1, Math.floor(days / 7)) === 0 || daysProcessed === 1) ) {
                    updateUI(); // 更新日期显示，让玩家看到变化
                }
                // 使用 requestAnimationFrame 或短 setTimeout 来平滑处理多天推进
                requestAnimationFrame(processDay);
            }
        };
        requestAnimationFrame(processDay); // 启动第一天处理
    }


    // --- 6. 硬编码事件数据与逻辑 ---
    const hardcodedEvents = [
        {
            id: "economic_crisis_warning",
            triggerDate: new Date(1962, 0, 15).getTime(),
            triggered: false,
            title: "经济危机预警!",
            description: "国家经济顾问团提交紧急报告：国内金融市场出现剧烈动荡的不祥迹象。如果不立即采取果断措施进行干预，一场全面的经济危机恐怕在所难免，其后果将不堪设想。",
            options: [
                {
                    text: "必须稳定市场！我们承担得起代价。 (-50 PP, +10 稳定度)",
                    effects: () => {
                        gameState.politicalPower = Math.max(0, gameState.politicalPower - 50);
                        gameState.stability = Math.min(100, gameState.stability + 10);
                        logMessage("最高统帅部决定投入大量资金稳定市场。政治点数 -50, 国家稳定度 +10。");
                        gameState.flags["handled_crisis_early"] = true;
                    }
                },
                {
                    text: "保持冷静，密切观察局势发展。 (无直接消耗)",
                    effects: () => {
                        logMessage("最高统帅部指示各部门保持克制，密切关注市场动态，暂不采取大规模干预措施。");
                        gameState.flags["ignored_crisis_warning"] = true;
                    }
                },
                {
                    text: "这不过是杞人忧天罢了，我们的经济坚如磐石！ (-5 稳定度)",
                    effects: () => {
                        gameState.stability = Math.max(0, gameState.stability - 5);
                        logMessage("一些官员认为经济顾问的报告过于悲观，最高统帅部选择相信经济的自我调节能力。国家稳定度 -5。");
                        gameState.flags["dismissed_crisis_warning"] = true;
                    }
                }
            ]
        },
        {
            id: "ignored_crisis_consequence",
            triggerCondition: () => gameState.flags["ignored_crisis_warning"] &&
                                  !gameState.flags["crisis_erupted"] &&
                                  gameState.currentDate.getTime() >= new Date(1962, 1, 1).getTime(), // 月份从0开始
            triggered: false,
            title: "经济危机全面爆发！",
            description: "不幸的消息接踵而至：由于未能及时对市场异动采取有效应对，一场席卷全国的经济危机已然爆发。银行挤兑、工厂倒闭、失业率飙升……民众的恐慌情绪正在蔓延，帝国的根基摇摇欲坠。",
            options: [
                {
                    text: "该死！我们错过了最佳时机…… (-20 稳定度, -30 PP)",
                    effects: () => {
                        gameState.stability = Math.max(0, gameState.stability - 20);
                        gameState.politicalPower = Math.max(0, gameState.politicalPower - 30);
                        logMessage("经济危机全面爆发，对国家造成沉重打击。国家稳定度 -20, 政治点数 -30。");
                        gameState.flags["crisis_erupted"] = true;
                    }
                }
            ]
        }
    ];

    function checkEvents() {
        if (eventPopup && eventPopup.style.display === 'block') {
            return;
        }

        for (const eventData of hardcodedEvents) {
            if (eventData.triggered) continue;

            let shouldTrigger = false;
            // 确保 gameState.currentDate 是一个 Date 对象
            const currentDateEpoch = gameState.currentDate.getTime();

            if (eventData.triggerDate && currentDateEpoch === eventData.triggerDate) {
                shouldTrigger = true;
            } else if (eventData.triggerCondition && typeof eventData.triggerCondition === 'function' && eventData.triggerCondition()) {
                shouldTrigger = true;
            }

            if (shouldTrigger) {
                triggerEventUI(eventData);
                eventData.triggered = true;
                break;
            }
        }
    }

    function triggerEventUI(eventData) {
        if (!eventPopup || !eventTitle || !eventDescription || !eventOptionsContainer) {
            console.error("Event UI elements not found!");
            return;
        }
        logMessage(`事件触发: ${eventData.title}`);
        eventTitle.textContent = eventData.title;
        eventDescription.textContent = eventData.description;
        eventOptionsContainer.innerHTML = '';

        eventData.options.forEach(optionConfig => {
            const optionButton = document.createElement('button');
            optionButton.textContent = optionConfig.text;
            optionButton.onclick = () => {
                if (typeof optionConfig.effects === 'function') {
                    optionConfig.effects();
                }
                eventPopup.style.display = 'none';
                updateUI();
                setTimeout(checkEvents, 100); // 给UI一点时间反应，然后再检查后续事件
            };
            eventOptionsContainer.appendChild(optionButton);
        });

        eventPopup.style.display = 'block';
    }

    // --- 7. 事件监听器 ---
    if (advanceTimeBtn) {
        advanceTimeBtn.addEventListener('click', () => advanceTime(1));
    } else {
        console.error("Button 'advance-time-btn' not found in the DOM.");
    }

    if (advanceWeekBtn) {
        advanceWeekBtn.addEventListener('click', () => advanceTime(7));
    } else {
        console.error("Button 'advance-week-btn' not found in the DOM.");
    }

    // --- 初始加载 ---
    // 确保在DOM完全加载后，所有元素都可用
    if (document.readyState === 'loading') { // 应该不会进入这里，因为有 DOMContentLoaded
        document.addEventListener('DOMContentLoaded', initializeGame);
    } else {
        initializeGame();
    }

    function initializeGame() {
        updateUI();
        logMessage("游戏已加载。当前国家: " + gameState.countryTag + "，领袖: " + gameState.leader);
        setTimeout(checkEvents, 100); // 稍微延迟一下，确保一切就绪
    }
});