export function makeDict(list) {
    var res = {};

    list.forEach(function (item) {
        res[item[0]] = item[1];
    });

    return res;
};
