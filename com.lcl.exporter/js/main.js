var cs = new CSInterface();

document.addEventListener('DOMContentLoaded', function () {
    // 初始化UI事件监听
    initEventListeners();
});

function initEventListeners() {
    // 浏览按钮点击事件
    document.getElementById('browse-path').addEventListener('click', function () {
        // 获取当前路径（如果有的话）
        var currentPath = document.getElementById('export-path').value || "";

        cs.evalScript('openFolder()', function (result) {
            if (result && result !== 'null' && result !== 'undefined') {
                // 可能返回的字符串里包含转义的反斜杠，先把任意形式的反斜杠都规范为 '/'
                var folderPath = result.replace(/\\\\/g, '/').replace(/\\/g, '/');
                document.getElementById('export-path').value = folderPath;
                showStatus('已选择导出路径: ' + folderPath, '');
            } else {
                showStatus('未选择导出文件夹', 'error');
            }
        });
    });

    // 导出格式改变事件
    document.getElementById('export-format').addEventListener('change', function () {
        // 如果选择了JPG格式，显示质量设置
        var qualityRow = document.getElementById('jpg-quality-row');
        if (this.value === 'jpg') {
            qualityRow.style.display = 'flex';
        } else {
            qualityRow.style.display = 'none';
        }
    });

    // JPG质量滑块值变化事件
    document.getElementById('jpg-quality').addEventListener('input', function () {
        document.getElementById('jpg-quality-value').textContent = this.value;
    });

    // 导出按钮点击事件
    document.getElementById('export-layers').addEventListener('click', function () {
        // 获取导出设置
        var exportPath = document.getElementById('export-path').value;
        var exportFormat = document.getElementById('export-format').value;
        // 获取选中的导出范围值： current | all | visible
        var exportRange = document.querySelector('input[name="export-range"]:checked').value;
        var jpgQuality = document.getElementById('jpg-quality').value;


        // 验证导出路径
        if (!exportPath) {
            showStatus('请选择导出路径', 'error');
            return;
        }


        // 显示导出状态
        showStatus('正在导出...', '');


        // 关键：将单个反斜杠转义为两个反斜杠，确保 ExtendScript 收到正确的路径
        var safePath = exportPath.replace(/\\/g, '\\\\');
        // 或者使用 forward slashes： var safePath = exportPath.replace(/\\/g, '/');

        // 用字符串拼接避免模板字面量中转义问题
        var script = 'exportLayers("' + safePath + '", "' + exportFormat + '", "' + exportRange + '", ' + jpgQuality + ')';

        cs.evalScript(script, function (result) {
            if (result === 'success') {
                showStatus('导出成功!', 'success');
            } else {
                showStatus('导出失败: ' + result, 'error');
            }
        });
    });
}

/**
 * 显示状态信息
 * @param {string} message 状态消息
 * @param {string} type 状态类型 (success, error, '')
 */
function showStatus(message, type) {
    var statusElement = document.getElementById('export-status');
    statusElement.textContent = message;
    statusElement.className = 'export-status';

    if (type) {
        statusElement.classList.add(type);
    }
}