<template>
  <div class="dropzone">
    <input type="file" name="file">
  </div>
</template>

<script>
import Dropzone from 'dropzone'
import 'dropzone/dist/dropzone.css'
import { getToken } from '@/api/qiniu'
import Emitter from '@/mixins/emitter'

Dropzone.autoDiscover = false

export default {
  mixins: [Emitter],
  props: {
    clickable: {
      type: Boolean,
      default: true
    },
    defaultMsg: {
      type: String,
      default: '上传图片'
    },
    acceptedFiles: {
      type: String,
      default: ''
    },
    thumbnailHeight: {
      type: Number,
      default: 150
    },
    thumbnailWidth: {
      type: Number,
      default: 150
    },
    showRemoveLink: {
      type: Boolean,
      default: true
    },
    maxFilesize: {
      type: Number,
      default: 2
    },
    maxFiles: {
      type: Number,
      default: 3
    },
    autoProcessQueue: {
      type: Boolean,
      default: true
    },
    useCustomDropzoneOptions: {
      type: Boolean,
      default: false
    },
    defaultImg: {
      default: '',
      type: [String, Array]
    },
    couldPaste: {
      type: Boolean,
      default: false
    },
    pickImg: String
  },
  data () {
    return {
      dropzone: '',
      initOnce: true,
      qiniu: {
        upUrl: '',
        domainName: '',
        token: ''
      }
    }
  },
  watch: {
    defaultImg (val) {
      if (val.length === 0) {
        this.initOnce = false
        return
      }
      if (!this.initOnce) return
      this.dropzone.options.init.call(this.dropzone)
    },
    pickImg (val) {
      this.dropzone.getAcceptedFiles().forEach(item => {
        item.url === val ? item.previewElement.classList.add('picked') : item.previewElement.classList.remove('picked')
      })
    }
  },
  mounted () {
    const vm = this

    this.dropzone = new Dropzone(this.$el, {
      url: 'https://www.example.com/',
      clickable: this.clickable,
      thumbnailWidth: this.thumbnailWidth,
      thumbnailHeight: this.thumbnailHeight,
      maxFiles: this.maxFiles,
      maxFilesize: this.maxFilesize,
      dictRemoveFile: '删除',
      addRemoveLinks: this.showRemoveLink,
      acceptedFiles: this.acceptedFiles,
      autoProcessQueue: this.autoProcessQueue,
      dictDefaultMessage: '<i style="margin-top: 3em;display: inline-block" class="material-icons">' + this.defaultMsg + '</i><br>Drop files here to upload',
      dictMaxFilesExceeded: `最多${this.maxFiles}张图片`,
      previewTemplate: `
        <div class="dz-preview dz-file-preview">
          <div class="dz-image" style="width:${this.thumbnailWidth}px;height:${this.thumbnailHeight}px">
            <img style="width:${this.thumbnailWidth}px;height:${this.thumbnailHeight}px" data-dz-thumbnail />
          </div>
          <div class="dz-progress">
            <span class="dz-upload" data-dz-uploadprogress></span>
          </div>
          <div class="dz-error-message">
            <span data-dz-errormessage></span>
          </div>
          <div class="dz-success-mark">
            <svg width="54px" height="54px" viewBox="0 0 54 54" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns">
              <!-- Generator: Sketch 3.2.1 (9971) - http://www.bohemiancoding.com/sketch -->
              <title>Check</title>
              <desc>Created with Sketch.</desc>
              <defs></defs>
                <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">
                  <path d="M23.5,31.8431458 L17.5852419,25.9283877 C16.0248253,24.3679711 13.4910294,24.366835 11.9289322,25.9289322 C10.3700136,27.4878508 10.3665912,30.0234455 11.9283877,31.5852419 L20.4147581,40.0716123 C20.5133999,40.1702541 20.6159315,40.2626649 20.7218615,40.3488435 C22.2835669,41.8725651 24.794234,41.8626202 26.3461564,40.3106978 L43.3106978,23.3461564 C44.8771021,21.7797521 44.8758057,19.2483887 43.3137085,17.6862915 C41.7547899,16.1273729 39.2176035,16.1255422 37.6538436,17.6893022 L23.5,31.8431458 Z M27,53 C41.3594035,53 53,41.3594035 53,27 C53,12.6405965 41.3594035,1 27,1 C12.6405965,1 1,12.6405965 1,27 C1,41.3594035 12.6405965,53 27,53 Z" id="Oval-2" stroke-opacity="0.198794158" stroke="#747474" fill-opacity="0.816519475" fill="#FFFFFF" sketch:type="MSShapeGroup"></path>
                </g>
            </svg>
          </div>
          <div class="dz-error-mark">
            <svg width="54px" height="54px" viewBox="0 0 54 54" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:sketch="http://www.bohemiancoding.com/sketch/ns">
              <!-- Generator: Sketch 3.2.1 (9971) - http://www.bohemiancoding.com/sketch -->
              <title>error</title>
              <desc>Created with Sketch.</desc>
              <defs></defs>
              <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">
                <g id="Check-+-Oval-2" sketch:type="MSLayerGroup" stroke="#747474" stroke-opacity="0.198794158" fill="#FFFFFF" fill-opacity="0.816519475">
                  <path d="M32.6568542,29 L38.3106978,23.3461564 C39.8771021,21.7797521 39.8758057,19.2483887 38.3137085,17.6862915 C36.7547899,16.1273729 34.2176035,16.1255422 32.6538436,17.6893022 L27,23.3431458 L21.3461564,17.6893022 C19.7823965,16.1255422 17.2452101,16.1273729 15.6862915,17.6862915 C14.1241943,19.2483887 14.1228979,21.7797521 15.6893022,23.3461564 L21.3431458,29 L15.6893022,34.6538436 C14.1228979,36.2202479 14.1241943,38.7516113 15.6862915,40.3137085 C17.2452101,41.8726271 19.7823965,41.8744578 21.3461564,40.3106978 L27,34.6568542 L32.6538436,40.3106978 C34.2176035,41.8744578 36.7547899,41.8726271 38.3137085,40.3137085 C39.8758057,38.7516113 39.8771021,36.2202479 38.3106978,34.6538436 L32.6568542,29 Z M27,53 C41.3594035,53 53,41.3594035 53,27 C53,12.6405965 41.3594035,1 27,1 C12.6405965,1 1,12.6405965 1,27 C1,41.3594035 12.6405965,53 27,53 Z" id="Oval-2" sketch:type="MSShapeGroup"></path>
                </g>
              </g>
            </svg>
          </div>
          <a class="pick-btn"></a>
        </div>
      `,
      init () {
        const val = vm.defaultImg
        if (!val) return
        if (Array.isArray(val)) {
          if (val.length === 0) return
          val.map((v, i) => {
            const mockFile = { name: v, size: 12345, url: v, accepted: true }
            this.files.push(mockFile)
            this.options.addedfile.call(this, mockFile)
            this.options.thumbnail.call(this, mockFile, v)
            mockFile.previewElement.classList.add('dz-success')
            mockFile.previewElement.classList.add('dz-complete')
            mockFile.previewElement.querySelector('.pick-btn').onclick = () => {
              vm.$emit('update:pickImg', v)
              vm.dispatch('ElFormItem', 'el.form.change')
            }
            vm.initOnce = false
            return true
          })
        } else {
          const mockFile = { name: val, size: 12345, url: val }
          this.options.addedfile.call(this, mockFile)
          this.options.thumbnail.call(this, mockFile, val)
          mockFile.previewElement.classList.add('dz-success')
          mockFile.previewElement.classList.add('dz-complete')
          vm.initOnce = false
        }
      },
      accept (file, done) {
        getToken().then(res => {
          vm.qiniu = res.data
          this.options.url = res.data.upUrl
          done()
        })
      },
      sending (file, xhr, formData) {
        formData.append('token', vm.qiniu.token)
        vm.initOnce = false
      }
    })

    if (this.couldPaste) {
      document.addEventListener('paste', this.pasteImg)
    }

    this.dropzone.on('addedfile', file => {
      file.previewElement.querySelector('.pick-btn').onclick = () => {
        vm.$emit('update:pickImg', file.url)
        vm.dispatch('ElFormItem', 'el.form.change')
      }
      vm.$emit('dropzone-fileAdded', file)
    })
    this.dropzone.on('success', (file, res) => {
      file.url = vm.qiniu.domainName + res.key
      vm.$emit('dropzone-success', file, vm.dropzone.element)
      if (Array.isArray(vm.defaultImg)) {
        vm.$emit('update:defaultImg', vm.dropzone.getAcceptedFiles().map(({ url }) => url))
        vm.dispatch('ElFormItem', 'el.form.change')
      }
    })
    this.dropzone.on('removedfile', file => {
      vm.$emit('dropzone-removedFile', file)
      if (Array.isArray(vm.defaultImg)) {
        vm.$emit('update:defaultImg', vm.dropzone.getAcceptedFiles().map(({ url }) => url))
        vm.dispatch('ElFormItem', 'el.form.change')
      }
    })
    this.dropzone.on('error', (file, error, xhr) => {
      vm.$emit('dropzone-error', file, error, xhr)
    })
    this.dropzone.on('successmultiple', (file, error, xhr) => {
      vm.$emit('dropzone-successmultiple', file, error, xhr)
    })
  },
  destroyed () {
    document.removeEventListener('paste', this.pasteImg)
    this.dropzone.destroy()
  },
  methods: {
    removeAllFiles () {
      this.dropzone.removeAllFiles(true)
    },
    processQueue () {
      this.dropzone.processQueue()
    },
    pasteImg (event) {
      const items = (event.clipboardData || event.originalEvent.clipboardData).items
      if (items[0].kind === 'file') {
        this.dropzone.addFile(items[0].getAsFile())
      }
    }
  }
}
</script>

<style rel="stylesheet/scss" lang="scss">
.dropzone {
  border: 2px solid #E5E5E5;
  font-family: 'Roboto', sans-serif;
  color: #777;
  transition: background-color .2s linear;
  padding: 5px;
}

.dropzone input[name='file'] {
  display: none;
}

.dropzone .dz-image img {
  width: 100%;
  height: 100%;
}

.dropzone .dz-preview .dz-image {
  border-radius: 0px;
}

.dropzone .dz-preview .pick-btn {
  position: absolute;
  bottom: 0;
  width: 100%;
  text-align: center;
  z-index: 11;
  color: #fff;
  background-color: rgba(0, 0, 0, .6);
  cursor: pointer;
  opacity: 0;
}

.dropzone .dz-preview .pick-btn::before {
  content: "设为主图";
}

.dropzone .dz-preview:hover .pick-btn,
.dropzone .dz-preview.picked .pick-btn {
  opacity: 1;
}

.dropzone .dz-preview.picked .pick-btn::before {
  content: "主图";
}

.dropzone .dz-preview.dz-error:hover .pick-btn {
  display: none;
}

.dropzone .dz-preview .dz-remove {
  position: absolute;
  top: 0;
  right: 0;
  z-index: 90;
  width: 30px;
  line-height: 30px;
  font-size: 12px;
  color: #bbb;
  opacity: 0;
}

.dropzone .dz-preview:hover .dz-remove {
  opacity: 1;
}

.dropzone .dz-preview .dz-error-message {
  left: 50%;
  transform: translateX(-50%);
}
</style>
