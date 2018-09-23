window.Tesseract = Tesseract.create({
    workerPath: chrome.extension.getURL('libs/tesseract/worker.js'),
    corePath: chrome.extension.getURL('libs/tesseract/index-core.js'),
});

function detectCaptcha() {
    var c = document.getElementById('canv');
    var ctx = c.getContext("2d");
    var img = document.getElementById('imgname');
    ctx.drawImage(img, 0, 0);
    var imgData = ctx.getImageData(0, 0, c.width, c.height);
    var res = [];
    for (var i = 0; i < 58; i++) {
        res[i] = [];
        for (var j = 0; j < 22; j++) {
            var k = imgData.data[j * 58 * 4 + i * 4];
            if (k > 128) {
                res[i][j] = 0;
            } else {
                res[i][j] = 1;
            }
        }
    }
    var morphResult = [];
    for (var i = 0; i < 58; i++) {
        morphResult[i] = [];
        for (var j = 0; j < 22; j++) {
            if (i == 0 || j == 0) {
                morphResult[i][j] = 0;
            } else if (res[i - 1][j - 1] + res[i - 1][j] + res[i][j - 1] + res[i][j] <= 2) {
                morphResult[i][j] = 0;
            } else {
                morphResult[i][j] = 1;
            }
        }
    }
    morph.drawImage(morphResult, c);

    Tesseract.recognize(c, {
        lang: 'eng',
        tessedit_char_whitelist: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
        tessedit_enable_doc_dict: 0,
        language_model_penalty_non_dict_word: 0.0,
        language_model_penalty_non_freq_dict_word: 0.0,
        language_model_penalty_case: 0.0,
        language_model_penalty_chartype: 0.0,
        language_model_penalty_spacing: 0.0,
        segment_penalty_dict_case_bad: 1.0,
        segment_penalty_dict_case_ok: 1.0,
        segment_penalty_dict_nonword: 1.0,
        segment_penalty_garbage: 1.0,
        segment_reward_chartype: 1.0,
    }).then(function (result) {
        const code = result.text.replace(/[^a-z0-9A-Z]/g, '')
        if (code.length != 4) {
            eventHandler.detectCaptchaError();
        } else {
            eventHandler.validatePass = function () {
                $('#validCode').val(code);
                eventHandler.detectCaptchaSuccess();
            }
            eventHandler.validateNotPass = function (message) {
                eventHandler.detectCaptchaError();
            }
            validate(code);
        }
    })
}