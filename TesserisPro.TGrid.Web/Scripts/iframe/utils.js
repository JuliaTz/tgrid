//#region Ckecks with "null" and "undefined".
function isNull(target) {
    return target == null;
}

function isNotNull(target) {
    return target != null;
}
;

function isUndefined(target) {
    return typeof target == "undefined";
}
;

function isNotUndefined(target) {
    return typeof target != "undefined";
}
;

function isNoU(target) {
    return isUndefined(target) || isNull(target);
}
;

function isNotNoU(target) {
    return isNotUndefined(target) && isNotNull(target);
}
;

function isFunction(target) {
    var getType = {};
    return target && getType.toString.call(target) === '[object Function]';
}

function isObservable(target) {
    var getType = {};
    return target && getType.toString.call(target) === '[object Function]';
}

function insertAfter(refElem, addingElem) {
    var parent = refElem.parentNode;
    var next = refElem.nextSibling;
    if (next) {
        return parent.insertBefore(addingElem, next);
    } else {
        return parent.appendChild(addingElem);
    }
}

function insertBefore(refElem, addingElem) {
    var parent = refElem.parentNode;
    return parent.insertBefore(addingElem, refElem);
}

function getMemberValue(target, path) {
    if (path == null || path.length == 0) {
        return target;
    }

    var pathNames = path.split('.');
    var value = target;
    while (pathNames.length > 0) {
        value = value[pathNames[0]];
        pathNames.splice(0, 1);
    }

    return value;
}

function hideElement(target) {
    target.style.display = "none";
}

function unhideElement(target) {
    target.style.display = "";
}
//# sourceMappingURL=utils.js.map
