export default (cb) => (e) => {
    let fileReader = new FileReader();
    let file = e.target.files[0];
    //如果是组件文件
    fileReader.onload = function (e) {
        fileReader.onload = null;
        cb(JSON.parse(e.target.result));
    }
    fileReader.readAsText(file);

}