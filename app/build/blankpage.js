"use strict";
function blankScreenPageConfigure() {
    const params = new URLSearchParams(window.location.search);
    const msg = params.get('msg');
    if (msg) {
        let item = document.getElementsByClassName("bs_message");
        if (item.length > 0) {
            item[0].innerText = decodeURIComponent(msg);
        }
    }
    const blankedBy = params.get('by');
    if (blankedBy) {
        let item = document.getElementsByClassName("clsid_message");
        if (item.length > 0) {
            item[0].innerText = decodeURIComponent(blankedBy);
        }
    }
    const imageUrl = params.get('url');
    if (imageUrl) {
        let str = "url('" + imageUrl + "')";
        document.body.style.backgroundImage = decodeURIComponent(str);
    }
}
window.onload = function () {
    blankScreenPageConfigure();
    document.addEventListener("keydown", function (e) {
        var charCode = e.charCode || e.keyCode;
        if (charCode !== 0) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    });
    document.addEventListener("keyup", function (e) {
        var charCode = e.charCode || e.keyCode;
        if (charCode !== 0) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    });
};
//# sourceMappingURL=blankpage.js.map