

function openFolder(initialPath) {
    // 打开选择文件夹对话框并返回选中文件夹的路径字符串（或 null）
    var newLocation = Folder.selectDialog("选择导出文件夹...");
    if (newLocation != null) {
        return newLocation.fsName;
    } else {
        return null;
    }
}


/**
 * 导出图层为指定格式
 * @param {string} exportPath 导出路径
 * @param {string} exportFormat 导出格式 (png, jpg, tga)
 * @param {string} exportRange 导出范围 ("current" | "all" | "visible")
 * @param {number} jpgQuality JPG质量 (1-12)
 * @returns {string} 成功返回 "success"，失败返回错误信息
 */
function exportLayers(exportPath, exportFormat, exportRange, jpgQuality) {

    try {
        if (!app.documents.length) {
            return "没有打开的文档！";
        }

        var doc = app.activeDocument;
        var folder = new Folder(exportPath);

        if (!folder.exists) {
            folder.create();
        }

        // 保存当前状态
        var activeLayer = doc.activeLayer;
        var visibleLayers = [];

        // 处理导出格式选项
        var saveOptions;
        var fileExtension;

        switch (exportFormat) {
            case "png":
                saveOptions = new PNGSaveOptions();
                saveOptions.compression = 0; // 无压缩
                saveOptions.interlaced = false;
                fileExtension = ".png";
                break;

            case "jpg":
                saveOptions = new JPEGSaveOptions();
                saveOptions.quality = parseInt(jpgQuality, 10);
                saveOptions.embedColorProfile = true;
                saveOptions.formatOptions = FormatOptions.STANDARDBASELINE;
                saveOptions.scans = 3;
                fileExtension = ".jpg";
                break;

            case "tga":
                saveOptions = new TargaSaveOptions();
                saveOptions.resolution = TargaBitsPerPixels.THIRTYTWO;
                saveOptions.alphaChannels = true;
                fileExtension = ".tga";
                break;

            default:
                return "不支持的导出格式！";
        }

        if (exportRange === "current") {
            // 仅导出当前图层（隐藏其他图层）
            var currentLayer = doc.activeLayer;

            // 记录所有图层的可见性
            for (var i = 0; i < doc.artLayers.length; i++) {
                visibleLayers.push(doc.artLayers[i].visible);
                doc.artLayers[i].visible = false;
            }

            // 只显示当前图层
            currentLayer.visible = true;

            // 准备文件名
            var fileName = currentLayer.name;
            var folderPath = folder.fsName.replace(/\\/g, "/");
            var filePath = folderPath + "/" + fileName + fileExtension;

            var saveFile = new File(filePath);
            doc.saveAs(saveFile, saveOptions, true, Extension.LOWERCASE);

            // 恢复图层可见性
            for (var i = 0; i < doc.artLayers.length; i++) {
                doc.artLayers[i].visible = visibleLayers[i];
            }
            //打开文件夹
            folder.execute();
            return "success";

        } else if (exportRange === "visible") {
            // 导出当前显示（不修改现有图层的可见性）
            // 使用文档副本，合并可见图层后导出
            var dupDoc = doc.duplicate();
            try {
                dupDoc.flatten();
                // 文件名以文档名（去掉扩展名）
                var baseName = doc.name.replace(/\.[^\.]+$/, "");
                var folderPath = folder.fsName.replace(/\\/g, "/");
            alert("folderPath: " + folderPath);

                var filePath = folderPath + "/" + baseName + fileExtension;

                var saveFile = new File(filePath);
                dupDoc.saveAs(saveFile, saveOptions, true, Extension.LOWERCASE);
            } finally {
                // 关闭副本，不保存更改
                dupDoc.close(SaveOptions.DONOTSAVECHANGES);
            }
            folder.execute();
            return "success";

        } else {
            // 导出所有图层（每个图层单独导出）
            // 记录所有图层的可见性
            for (var i = 0; i < doc.artLayers.length; i++) {
                visibleLayers.push(doc.artLayers[i].visible);
            }

            var exportedCount = 0;

            for (var i = 0; i < doc.artLayers.length; i++) {
                var layer = doc.artLayers[i];

                // 隐藏所有图层
                for (var j = 0; j < doc.artLayers.length; j++) {
                    doc.artLayers[j].visible = false;
                }

                // 只显示当前处理的图层
                layer.visible = true;

                // 准备文件名
                var fileName = layer.name;
                var folderPath = folder.fsName.replace(/\\/g, "/");
                var filePath = folderPath + "/" + fileName + fileExtension;

                // 使用标准saveAs方法导出PNG和JPG
                var saveFile = new File(filePath);
                doc.saveAs(saveFile, saveOptions, true, Extension.LOWERCASE);
                exportedCount++;
            }

            // 恢复图层可见性
            for (var i = 0; i < doc.artLayers.length; i++) {
                doc.artLayers[i].visible = visibleLayers[i];
            }

            // 恢复当前选中的图层
            doc.activeLayer = activeLayer;
            folder.execute();
            return "success";
        }

    } catch (e) {
        alert("导出图层错误: " + e);
        return "错误: " + e.toString();
    }
}