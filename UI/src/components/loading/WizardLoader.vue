<template>
  <div class="wizard-loader">
    <div class="scene">
      <div class="objects" aria-hidden="true">
        <div class="square"></div>
        <div class="circle"></div>
        <div class="triangle"></div>
      </div>

      <div class="wizard" aria-hidden="true">
        <div class="body"></div>

        <div class="right-arm">
          <div class="right-hand"></div>
        </div>

        <div class="left-arm">
          <div class="left-hand"></div>
        </div>

        <div class="head">
          <div class="beard"></div>
          <div class="face">
            <div class="adds"></div>
          </div>

          <div class="hat">
            <div class="hat-of-the-hat"></div>
            <div class="four-point-star --first"></div>
            <div class="four-point-star --second"></div>
            <div class="four-point-star --third"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="progress" aria-hidden="true"></div>
    <div class="noise" aria-hidden="true"></div>
  </div>
</template>

<script setup>
// 纯静态展示组件，无逻辑
</script>

<style>
/* 全局变量（组件内使用） */
:root{
  --primary: #3f64ce;
  --skin: #f1c5b4;
  --background: #ffffff;
}

/* 根容器：不再影响 body，方便放在任意页面 */
.wizard-loader {
  width: 100%;
  min-height: 360px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 28px;
  background: transparent;
  box-sizing: border-box;
  padding: 36px 12px;
}


/* 场景：水平居中，左侧 shapes，右侧 wizard */
.scene{
  width: 100%;
  max-width: 1100px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 120px; /* 控制 shapes 与 wizard 间距 */
}

/* objects（左侧）调整为更小且位于中上方 */
.objects{
  position: relative;
  width: 120px;
  height: 160px;
  flex: 0 0 auto;
  display:block;
}

/* 调整三形状大小和位置，和原始动画更接近 */
.square{
  position: absolute;
  top: 24px;
  left: 30px;
  width: 34px;
  height: 34px;
  /* square 用 ::after 显示实心小方块（原设计） */
  transform: rotate(-16deg);
  animation: path_square 10s ease-in-out infinite;
}
.square::after{
  content: "";
  position: absolute;
  top: -6px;
  left: -6px;
  width: 34px;
  height: 34px;
  background: #9ab3f5;
  border-radius: 4px;
}

.circle{
  position: absolute;
  top: 44px;
  left: 0;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  animation: path_circle 10s ease-in-out infinite;
}
.circle::after{
  content: "";
  position: absolute;
  bottom: -4px;
  left: 6px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #c56183;
}

.triangle{
  position: absolute;
  top: 12px;
  left: 68px;
  width: 0;
  height: 0;
  animation: path_triangle 10s ease-in-out infinite;
}
.triangle::after{
  content: "";
  position: absolute;
  top: 0;
  right: -10px;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 18px 30px 18px;
  border-color: transparent transparent #89beb3 transparent;
}

/* Wizard（右侧）尺寸稍微缩小以匹配预期图 */
.wizard{
  position: relative;
  width: 160px;
  height: 200px;
  flex: 0 0 auto;
}

/* 身体、手臂、头部等直接复用原始关键点，但调整位置/尺寸 */
.body{
  position: absolute;
  bottom: 0;
  left: 56px;
  height: 86px;
  width: 54px;
  background: var(--primary);
}
.body::after{
  content: "";
  position: absolute;
  bottom: 0;
  left: 18px;
  height: 86px;
  width: 54px;
  background: var(--primary);
  transform: skewX(14deg);
}

/* 右臂 */
.right-arm{
  position: absolute;
  bottom: 62px;
  left: 100px;
  height: 40px;
  width: 80px;
  background: var(--primary);
  border-radius: 20px;
  transform-origin: 14px 20px;
  transform: rotate(70deg);
  animation: right_arm 10s ease-in-out infinite;
}
.right-hand{
  position: absolute;
  right: 8px;
  bottom: 6px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--skin);
  transform-origin: center center;
  transform: rotate(-40deg);
  animation: right_hand 10s ease-in-out infinite;
}
.right-hand::after{
  content: "";
  position: absolute;
  right: 0;
  top: -6px;
  width: 13px;
  height: 26px;
  border-radius: 8px;
  background: var(--skin);
  transform: translateY(14px);
  animation: right_finger 10s ease-in-out infinite;
}

/* 左臂 */
.left-arm{
  position: absolute;
  bottom: 62px;
  left: 20px;
  height: 40px;
  width: 64px;
  background: var(--primary);
  border-bottom-left-radius: 8px;
  transform-origin: 56px 24px;
  transform: rotate(-70deg);
  animation: left_arm 10s ease-in-out infinite;
}
.left-hand{
  position: absolute;
  left: -16px;
  top: 0;
  width: 16px;
  height: 28px;
  border-top-left-radius: 30px;
  border-bottom-left-radius: 30px;
  background: var(--skin);
}
.left-hand::after{
  content: "";
  position: absolute;
  right: 0;
  top: 0;
  width: 26px;
  height: 13px;
  border-radius: 16px;
  background: var(--skin);
  transform-origin: right bottom;
  transform: scaleX(0);
  animation: left_finger 10s ease-in-out infinite;
}

/* 头部 */
.head{
  position: absolute;
  top: 0;
  left: 12px;
  width: 140px;
  height: 180px;
  transform-origin: center center;
  transform: rotate(-3deg);
  animation: head 10s ease-in-out infinite;
}
.beard{
  position: absolute;
  bottom: 0;
  left: 34px;
  height: 92px;
  width: 70px;
  border-bottom-right-radius: 55%;
  background: var(--background);
}
.beard::after{
  content: "";
  position: absolute;
  top: 14px;
  left: -8px;
  width: 36px;
  height: 18px;
  border-radius: 18px;
  background: var(--background);
}
.face{
  position: absolute;
  bottom: 68px;
  left: 34px;
  height: 28px;
  width: 56px;
  background: var(--skin);
}
.face::before{
  content: "";
  position: absolute;
  top: 0;
  left: 38px;
  width: 18px;
  height: 36px;
  border-bottom-right-radius: 18px;
  border-bottom-left-radius: 18px;
  background: var(--skin);
}
.face::after{
  content: "";
  position: absolute;
  top: 14px;
  left: -8px;
  width: 46px;
  height: 18px;
  border-radius: 18px;
  background: var(--background);
}
.adds{
  position: absolute;
  top: 0;
  left: -10px;
  width: 36px;
  height: 18px;
  border-radius: 18px;
  background: var(--skin);
}
.adds::after{
  content: "";
  position: absolute;
  top: 4px;
  left: 72px;
  width: 13px;
  height: 16px;
  border-bottom-right-radius: 16px;
  border-top-right-radius: 16px;
  background: var(--skin);
}
.hat{
  position: absolute;
  bottom: 90px;
  left: 0;
  width: 140px;
  height: 18px;
  border-radius: 18px;
  background: var(--primary);
}
.hat::before{
  content: "";
  position: absolute;
  top: -60px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 30px 60px 44px;
  border-color: transparent transparent var(--primary) transparent;
}
.hat::after{
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 140px;
  height: 18px;
  background: var(--primary);
  border-radius: 18px;
}
.hat-of-the-hat{
  position: absolute;
  bottom: 68px;
  left: 70px;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 0 22px 22px 18px;
  border-color: transparent transparent var(--primary) transparent;
}
.hat-of-the-hat::after{
  content: "";
  position: absolute;
  top: 6px;
  left: -4px;
  width: 30px;
  height: 10px;
  border-radius: 10px;
  background: var(--primary);
  transform: rotate(40deg);
}
.four-point-star{
  position: absolute;
  width: 10px;
  height: 10px;
}
.four-point-star::after,
.four-point-star::before{
  content: "";
  position: absolute;
  background: var(--background);
  display: block;
  left: 0;
  width: 141.4213%;
  top: 0;
  bottom: 0;
  border-radius: 10%;
  transform: rotate(66.66deg) skewX(45deg);
}
.four-point-star::after{
  transform: rotate(156.66deg) skew(45deg);
}
.four-point-star.--first{ bottom: 18px; left: 38px; }
.four-point-star.--second{ bottom: 28px; left: 70px; }
.four-point-star.--third{ bottom: 8px; left: 92px; }

/* progress：宽度改为百分比并限制最大值，居中显示 */
.progress{
  position: relative;
  width: min(70%, 720px);
  height: 18px;
  background: #e6e6e6;
  border-radius: 3px;
  overflow: hidden;
}
.progress::after{
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 58%; /* 默认进度视觉（你可调整或用 JS 动态） */
  height: 100%;
  background: #4f5958;
  animation: progress 20s linear infinite;
}

/* 噪点覆盖层（和原图一致） */
.noise{
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  background-image: url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAMAAAAp4XiDAAAAUVBMVEWFhYWDg4N3d3dtbW17e3t1dXWBgYGHh4d5eXlzc3OLi4ubm5uVlZWPj4+NjY19fX2JiYl/f39ra2uRkZGZmZlpaWmXl5dvb29xcXGTk5NnZ2c8TV1mAAAAG3RSTlNAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEAvEOwtAAAFVklEQVR4XpWWB67c2BUFb3g557T/hRo9/WUMZHlgr4Bg8Z4qQgQJlHI4A8SzFVrapvmTF9O7dmYRFZ60YiBhJRCgh1FYhiLAmdvX0CzTOpNE77ME0Zty/nWWzchDtiqrmQDeuv3powQ5ta2eN0FY0InkqDD73lT9c9lEzwUNqgFHs9VQce3TVClFCQrSTfOiYkVJQBmpbq2L6iZavPnAPcoU0dSw0SUTqz/GtrGuXfbyyBniKykOWQWGqwwMA7QiYAxi+IlPdqo+hYHnUt5ZPfnsHJyNiDtnpJyayNBkF6cWoYGAMY92U2hXHF/C1M8uP/ZtYdiuj26UdAdQQSXQErwSOMzt/XWRWAz5GuSBIkwG1H3FabJ2OsUOUhGC6tK4EMtJO0ttC6IBD3kM0ve0tJwMdSfjZo+EEISaeTr9P3wYrGjXqyC1krcKdhMpxEnt5JetoulscpyzhXN5FRpuPHvbeQaKxFAEB6EN+cYN6xD7RYGpXpNndMmZgM5Dcs3YSNFDHUo2LGfZuukSWyUYirJAdYbF3MfqEKmjM+I2EfhA94iG3L7uKrR+GdWD73ydlIB+6hgref1QTlmgmbM3/LeX5GI1Ux1RWpgxpLuZ2+I+IjzZ8wqE4nilvQdkUdfhzI5QDWy+kw5Wgg2pGpeEVeCCA7b85BO3F9DzxB3cdqvBzWcmzbyMiqhz6YqN1P+fEpLJfHFlS2v1E2GNVPTZHRX8C0Y2AA3gGI2uEY83OY2AAAAAElFTkSuQmCC");
  opacity: 0.08;
}

/* 关键帧（保留原动画节奏） */
@keyframes right_arm{ 0%{transform:rotate(70deg);}10%{transform:rotate(8deg);}15%{transform:rotate(20deg);}20%{transform:rotate(10deg);}25%{transform:rotate(26deg);}30%{transform:rotate(10deg);}35%{transform:rotate(28deg);}40%{transform:rotate(9deg);}45%{transform:rotate(28deg);}50%{transform:rotate(8deg);}58%{transform:rotate(74deg);}62%{transform:rotate(70deg);} }
@keyframes left_arm{ 0%{transform:rotate(-70deg);}10%{transform:rotate(6deg);}15%{transform:rotate(-18deg);}20%{transform:rotate(5deg);}25%{transform:rotate(-18deg);}30%{transform:rotate(5deg);}35%{transform:rotate(-17deg);}40%{transform:rotate(5deg);}45%{transform:rotate(-18deg);}50%{transform:rotate(6deg);}58%{transform:rotate(-74deg);}62%{transform:rotate(-70deg);} }
@keyframes right_hand{ 0%{transform:rotate(-40deg);}10%{transform:rotate(-20deg);}15%{transform:rotate(-5deg);}20%{transform:rotate(-60deg);}25%{transform:rotate(0deg);}30%{transform:rotate(-60deg);}35%{transform:rotate(0deg);}40%{transform:rotate(-40deg);}45%{transform:rotate(-60deg);}50%{transform:rotate(10deg);}60%{transform:rotate(-40deg);} }
@keyframes right_finger{ 0%{transform:translateY(16px);}10%,50%{transform:none;}60%{transform:translateY(16px);} }
@keyframes left_finger{ 0%{transform:scaleX(0);}10%{transform:scaleX(1) rotate(6deg);}15%{transform:scaleX(1) rotate(0);}20%{transform:scaleX(1) rotate(8deg);}25%{transform:scaleX(1) rotate(0);}30%{transform:scaleX(1) rotate(7deg);}35%{transform:scaleX(1) rotate(0);}40%{transform:scaleX(1) rotate(5deg);}45%{transform:scaleX(1) rotate(0);}50%{transform:scaleX(1) rotate(6deg);}58%{transform:scaleX(0);} }
@keyframes head{ 0%{transform:rotate(-3deg);}10%{transform:translateX(10px) rotate(7deg);}50%{transform:translateX(0) rotate(0);}56%{transform:rotate(-3deg);} }
@keyframes path_circle{ 0%{transform:translateY(0);}10%{transform:translateY(-60px) rotate(-5deg);}55%{transform:translateY(-60px) rotate(-360deg);}58%{transform:translateY(-60px) rotate(-360deg);}63%{transform:rotate(-360deg);} }
@keyframes path_square{ 0%{transform:translateY(0);}10%{transform:translateY(-90px) translateX(-18px) rotate(10deg);}55%{transform:translateY(-90px) translateX(-18px) rotate(-350deg);}57%{transform:translateY(-90px) translateX(-18px) rotate(-350deg);}63%{transform:rotate(-360deg);} }
@keyframes path_triangle{ 0%{transform:translateY(0);}10%{transform:translateY(-95px) translateX(10px) rotate(-10deg);}55%{transform:translateY(-95px) translateX(10px) rotate(-365deg);}58%{transform:translateY(-95px) translateX(10px) rotate(-365deg);}63%{transform:rotate(-360deg);} }
@keyframes progress{ from{width:0;} to{width:100%;} }
</style>
