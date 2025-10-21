function CopySelectionToNewLayer(name, active) {
    if (!app.documents.length) {
        alert("没有打开的文档！");
        return;
    }

    var doc = app.activeDocument;
    if (!doc.selection || doc.selection.isEmpty) {
        alert("当前没有选区，请先创建一个选区！");
        return;
    }

    // 复制选区内容到剪贴板
    doc.selection.copy();
    // 创建一个新图层
    var newLayer = doc.artLayers.add();
    newLayer.name = name;
    // 在新图层中粘贴内容
    doc.paste();
    // 取消选区
    doc.selection.deselect();

    if (active) {
        doc.activeLayer = newLayer;
    }
    return newLayer;
}

function CopyChannel(doc, channel, createNewLayer) {
    // 选择通道
    doc.activeChannels = [doc.channels.getByName(channel)];
    // 复制通道内容到剪贴板
    doc.selection.copy();
    if (createNewLayer) {
        // 创建一个新图层
        var newLayer = doc.artLayers.add();
        newLayer.name = channel + "通道图层";
    }
    // 粘贴剪贴板内容到新图层
    doc.paste();
    // 取消选择
    doc.selection.deselect();
    return newLayer;
}

function GammaToLinearLayer(layer) {
    layer.adjustLevels(0, 255, 1/2.2, 0, 255);
}

function LinearToGammaLayer(layer) {
    layer.adjustLevels(0, 255, 2.2, 0, 255);
}

// value: 0-1
function GammaToLinear(value) {
    return Math.pow(value, 1 / 2.2);
}
function LinearToGamma(value) {
    return Math.pow(value, 2.2);
}

function SetThreshold(layer, threshold) {
    threshold = GammaToLinear(threshold) * 255;
    layer.threshold(Math.floor(threshold));
}

function adjustLevel() {
    var d = new ActionDescriptor();
    d.putEnumerated(stringIDToTypeID("presetKind"), stringIDToTypeID("presetKindType"), stringIDToTypeID("presetKindCustom"));
    var list = new ActionList();
    var d1 = new ActionDescriptor();
    var r = new ActionReference();
    r.putEnumerated(stringIDToTypeID("channel"), stringIDToTypeID("channel"), stringIDToTypeID("composite"));
    d1.putReference(stringIDToTypeID("channel"), r);
    d1.putDouble(stringIDToTypeID("gamma"), 0.45);
    list.putObject(stringIDToTypeID("levelsAdjustment"), d1);
    d.putList(stringIDToTypeID("adjustment"), list);
    executeAction(stringIDToTypeID("levels"), d, DialogModes.NO);
}


function RGB2HSB(targetLayer) {
    var d = new ActionDescriptor();

    // if (targetLayer instanceof ArtLayer) {
    //     // 指定目标为特定图层
    //     var ref = new ActionReference();
    //     ref.putIdentifier(charIDToTypeID("Lyr "), targetLayer.id);
    //     d.putReference(charIDToTypeID("null"), ref);
    // }

    d.putEnumerated(stringIDToTypeID("input"), stringIDToTypeID("colorSpace"), stringIDToTypeID("RGBColor"));
    d.putEnumerated(stringIDToTypeID("output"), stringIDToTypeID("colorSpace"), stringIDToTypeID("HSBColorEnum"));
    executeAction(charIDToTypeID("HsbP"), d, DialogModes.NO);
}

function HSB2RGB() {
    var d = new ActionDescriptor();
    d.putEnumerated(stringIDToTypeID("input"), stringIDToTypeID("colorSpace"), stringIDToTypeID("HSBColorEnum"));
    d.putEnumerated(stringIDToTypeID("output"), stringIDToTypeID("colorSpace"), stringIDToTypeID("RGBColor"));
    executeAction(charIDToTypeID("HsbP"), d, DialogModes.NO);
}

/**
 * 检查选区明度范围并标记超出范围的像素
 * @param {boolean} isChecked 是否启用明度检查
 * @param {number} minBrightness 最小明度
 * @param {number} maxBrightness 最大明度
 */
function toggleBrightnessCheck(isChecked, minBrightness, maxBrightness) {
    if (!app.documents.length) {
        alert("没有打开的文档！");
        return;
    }

    var doc = app.activeDocument;
    if (!doc.selection) {
        alert("没有选区！");
        return;
    }
    // 复制选区内容到剪贴板
    //    var newLayer = CopySelectionToNewLayer("Check Layer",true);

    var layer = doc.activeLayer;
    var newLayer = layer.duplicate();
    newLayer.name = "Check Layer";
    doc.activeLayer = newLayer;

    GammaToLinearLayer(newLayer);
    RGB2HSB();
    var d = new ActionDescriptor();
    d.putEnumerated(stringIDToTypeID("presetKind"), stringIDToTypeID("presetKindType"), stringIDToTypeID("presetKindCustom"));
    var list = new ActionList();
    var d1 = new ActionDescriptor();
    var r = new ActionReference();
    r.putEnumerated(stringIDToTypeID("channel"), stringIDToTypeID("ordinal"), stringIDToTypeID("targetEnum"));
    d1.putReference(stringIDToTypeID("channel"), r);
    d1.putDouble(stringIDToTypeID("gamma"), 0.45);
    list.putObject(stringIDToTypeID("levelsAdjustment"), d1);
    d.putList(stringIDToTypeID("adjustment"), list);
    executeAction(stringIDToTypeID("levels"), d, DialogModes.NO);
    HSB2RGB();
    LinearToGammaLayer(newLayer);

    // newLayer = CopyChannel(doc, "蓝", true);
    // doc.activeLayer = newLayer;


    // var d = new ActionDescriptor();
    // d.putInteger(stringIDToTypeID("fuzziness"), 0);
    // var d1 = new ActionDescriptor();
    // d1.putDouble(stringIDToTypeID("luminance"), 153);
    // d1.putDouble(stringIDToTypeID("a"), 0);
    // d1.putDouble(stringIDToTypeID("b"), 0);
    // d.putObject(stringIDToTypeID("minimum"), stringIDToTypeID("labColor"), d1);
    // var d2 = new ActionDescriptor();
    // d2.putDouble(stringIDToTypeID("luminance"), 255);
    // d2.putDouble(stringIDToTypeID("a"), 0);
    // d2.putDouble(stringIDToTypeID("b"), 0);
    // d.putObject(stringIDToTypeID("maximum"), stringIDToTypeID("labColor"), d2);
    // d.putInteger(stringIDToTypeID("colorModel"), 0);
    // executeAction(stringIDToTypeID("colorRange"), d, DialogModes.NO);


    // // 创建一个新图层用于高亮显示
    // var highlightLayer = layer.duplicate();
    // highlightLayer.name = "Highlight Layer";

    // // 填充选区为红色
    // doc.selection.fill(app.foregroundColor);
    // doc.selection.deselect();

    // SetThreshold(newLayer, 0.6);

    // if (isChecked) {
    //     var selectionBounds = doc.selection.bounds;
    //     var width = selectionBounds[2] - selectionBounds[0];
    //     var height = selectionBounds[3] - selectionBounds[1];

    //     var layer = doc.activeLayer;

    //     if (doc.selection && !doc.selection.isEmpty) {
    //         // layer.desaturate();

    //         var duplicatedLayer = layer.duplicate();
    //         duplicatedLayer.name = "Brightness Check Overlay";

    //         // 转换成线性空间

    //         // 
    //         duplicatedLayer.threshold(Math.floor(0.6*255));

    //         // var tempLayer = doc.artLayers.add();
    //         // tempLayer.name = "Brightness Check Overlay";


    //         // 
    //     } else {
    //         alert("当前没有选区，请先创建一个选区！");
    //     }


    //     alert("明度检查完成，超出范围的像素已标记为红色！");
    // } else {
    //     // 恢复正常显示
    //     alert("取消明度检查");
    // }
}

// applyBrightnessAdjustments
function applyBrightnessAdjustments(factor, clampMin, clampMax) {
    if (!app.documents.length) {
        alert("没有打开的文档！");
        return;
    }

    var doc = app.activeDocument;
    if (!doc.selection || doc.selection.isEmpty) {
        alert("当前没有选区，请先创建一个选区！");
        return;
    }

    // 复制选区内容到剪贴板
    var newLayer = CopySelectionToNewLayer("Adjustment Layer", true);
    
    // 转换为线性空间
    // GammaToLinearLayer(newLayer);

    // 转换回伽马空间
    // LinearToGammaLayer(newLayer);

    alert("明度调整完成！");
}