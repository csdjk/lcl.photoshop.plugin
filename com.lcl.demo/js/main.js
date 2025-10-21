var cs = new CSInterface();

// 明度检查功能
document.getElementById('toggle-brightness-check').addEventListener('change', function () {
    const isChecked = this.checked;
    const minBrightness = document.getElementById('min-brightness').value;
    const maxBrightness = document.getElementById('max-brightness').value;

    cs.evalScript(`toggleBrightnessCheck(${isChecked}, ${minBrightness}, ${maxBrightness})`);
});

// 明度调整功能
document.getElementById('apply-adjustments').addEventListener('click', function () {
    const factor = document.getElementById('brightness-factor').value;
    const clampMin = document.getElementById('clamp-min').value;
    const clampMax = document.getElementById('clamp-max').value;

    cs.evalScript(`toggleBrightnessCheck(${isChecked}, ${minBrightness}, ${maxBrightness})`);
});



