new Vue({
    el: '#filemanager',
    data: {
        files: [],
        file: '',
        modal: {
            show: false,
            header: '',
            body: '',
            content: {
                type: null,
                data: null,
            }
        },
        //TODO Use not object. May array or some like this
        classObject: {
            'input-group-text': true,
            'btn-info': false,
            'btn-success': false,
            'btn-warning': false,
            'btn-danger': false,
        },
        selectedFileName: 'Choose file',
        uploadButtonIsDisabled: true,
    },
    created: function () {
        this.getFileList();
    },
    methods: {
        viewContent: function(file) {
			this.modal.header = file.name;
			this.modal.content.type = file.type;
            this.getFile(file.name);
        },
        getFileList: function() {
            var vm = this;
            axios.post('api.php?q=' + JSON.stringify({
                action: 'getFileList'
            }))
            .then(function(response) {
                vm.files = response.data.files;
            })
            .catch(function(error) {
                console.error('Error API. ' + error);
            })
        },
        confirm: function(filename) {
            this.modal.header = 'Are you realy want remove: "' + filename + '"?';
            this.modal.content.type = 'confirm';
            this.modal.content.data = filename;
            this.modal.show = true;
        },
        removeFile: function(name) {
            var vm = this;
            axios.post('api.php?q=' + JSON.stringify({
                action: 'removeFile',
                filename: name
            }))
            .then(function(response) {
                vm.getFileList();
            })
            .catch(function(error) {
                console.error('Error API. ' + error);
            });
        },
        onFileChange: function(e) {
            var files = e.target.files || e.dataTransfer.files;
            if (!files.length)
                return;
            this.file = files[0];
            this.selectedFileName = this.file.name;
            this.classObject['input-group-text'] = false;
            this.classObject['btn-info'] = true;
            this.classObject['btn-success'] = false;
            this.classObject['btn-warning'] = false;
            this.classObject['btn-danger'] = false;
            this.uploadButtonIsDisabled = false;
        },
        submitFile: function() {
            var vm = this;
            var formData = new FormData();
            formData.append('file', this.file);
            axios.post( 'api.php?q=' + JSON.stringify({
                action: 'putFile'
            }), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })
            .then(function(response) {
                if (response.data == 'file uploaded') {
                    vm.classObject['btn-info'] = false;
                    vm.classObject['btn-success'] = true;
                    vm.classObject['btn-warning'] = false;
                    vm.classObject['btn-danger'] = false;
                    vm.selectedFileName = 'Choose file';
                    vm.uploadButtonIsDisabled = true;
                    vm.getFileList();
                } else if (response.data == 'error') {
                    vm.classObject['btn-info'] = false;
                    vm.classObject['btn-success'] = false;
                    vm.classObject['btn-warning'] = true;
                    vm.classObject['btn-danger'] = false;
                }
            })
            .catch(function(error) {
                console.error('Error API. ' + error);
                vm.classObject['btn-info'] = false;
                vm.classObject['btn-success'] = false;
                vm.classObject['btn-warning'] = false;
                vm.classObject['btn-danger'] = true;
            });
        },
        getFile: function(name) {
            var vm = this;
            axios.post('api.php?q=' + JSON.stringify({
                action: 'getFile',
                filename: name,
            }))
            .then(function(response) {
                vm.modal.content.data = response.data;
                vm.modal.show = true;
            })
            .catch(function(error) {
                console.error('Error API. ' + error);
            })
        },
    },
    components: {
        modal: {
            template: '#modal-window',
            props: ['header', 'body', 'content'],
        }
    },
    filters: {
        formatDate: function(timestamp) {
            if (typeof timestamp === 'number') {
                var time =  moment.unix(timestamp);
                if (time.format('YYYY') == moment().format('YYYY')) {
                    return time.format('MMM D HH:mm');
                } else {
                    return time.format('MMM D YYYY');
                }
            } else {
                return null;
            }
        },
        formatSize: function(bytes) {
            if (0 == bytes ) {
                return 0;
            }
            var unit = [ '', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y' ],
            d = Math.floor(Math.log(bytes) / Math.log(1024));
            return parseFloat((bytes / Math.pow(1024, d)).toFixed(0)) + unit[d];
        },
    }
})
/* vim: set foldmethod=indent foldlevel=2: */
