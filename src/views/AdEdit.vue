<template>
  <div class="about">
    <h1>{{id ? '编辑':'新增'}}广告位</h1>
    <el-form label-width="120px" @submit.native.prevent="save">
      <el-form-item label="名称">
        <el-input v-model="model.name"></el-input>
      </el-form-item>
      <el-form-item label="广告">
        <el-button size="small" @click="model.items.push({})">
          <i class="el-icon-plus">添加广告</i>
        </el-button>
        <el-row type="flex" style="flex-wrap: wrap">
          <el-col :md="24" v-for="(item,i) in model.items" :key="i">
            <el-form-item label="跳转链接(URL)">
              <el-input v-model="item.url"></el-input>
            </el-form-item>
            <el-form-item label="图片" style="margin-top:0.5rem">
              <el-upload
                class="avatar-uploader"
                action="mixinUploadUrl"
                :show-file-list="false"
                :headers="mixinGetAuthHeaders()"
                :before-upload="uploadItem(i)"
                :http-request="cutImage"
              >
                <img v-if="item.image" :src="item.image" class="avatar" />
                <i v-else class="el-icon-plus avatar-uploader-icon"></i>
              </el-upload>
            </el-form-item>
            <el-form-item>
              <el-button size="small" type="danger" @click="model.items.splice(i,1)">删除</el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" native-type="submit">保存</el-button>
      </el-form-item>
    </el-form>
    <el-dialog title="剪切图片" :visible.sync="dialogVisible">
      <div style="width:100%;height:400px">
        <vue-cropper autoCrop :img="cutimage" ref="cropper" :fixedNumber="[16,9]" centerBox />
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button icon="el-icon-refresh-right" circle @click="rotateRightImage"></el-button>
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="uploadImage">
          上传
          <i class="el-icon-upload el-icon--right"></i>
        </el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
import { VueCropper } from "vue-cropper";
export default {
  props: {
    id: {}
  },
  components: {
    VueCropper
  },
  data() {
    return {
      model: {
        items: []
      },
      dialogVisible: false,
      cutimage: "",
      aftercut: "",
      uploaditem:0
    };
  },
  methods: {
    async save() {
      let res;
      if (this.id) {
        res = await this.$http.put(`rest/ads/${this.id}`, this.model);
      } else {
        res = await this.$http.post("rest/ads", this.model);
      }
      if (res.data) {
        this.$router.push("/ads/list");
        this.$message({
          type: "success",
          message: "保存成功"
        });
      } else {
        this.$message({
          type: "faill",
          message: "保存失败"
        });
      }
    },
    uploadItem(i){
      this.uploaditem=i
      console.log(this.uploaditem);
    },
    async cutImage(parms) {
      this.cutimage = await this.getBase64(parms.file);
      this.dialogVisible = true;
    },
    rotateRightImage() {
      this.$refs.cropper.rotateRight();
    },
    async uploadImage() {
      this.dialogVisible = false;
      this.$refs.cropper.getCropData(async data => {
        let file = this.dataURLtoFile(data);
        const formData = new FormData(); // 声明一个FormData对象
        formData.append("file", file);
        const res = await this.$http.post(
          this.$http.defaults.baseURL + "/upload",
          formData,
          {
            headers: { Authorization: `Bearer ${localStorage.token || ""}` }
          }
        );
        console.log(res.data);
        console.log(this.model);
        let i =this.uploaditem
        this.model.items[i].image = res.data.url;
      });
    },
    async fetch() {
      const res = await this.$http.get(`rest/ads/${this.id}`);
      this.model = Object.assign({}, this.model, res.data);
    },
    getBase64(file) {
      return new Promise((resolve, reject) => {
        let reader = new FileReader();
        let fileResult = "";
        reader.readAsDataURL(file); //开始转
        reader.onload = function() {
          fileResult = reader.result;
        }; //转 失败
        reader.onerror = function(error) {
          reject(error);
        }; //转 结束  咱就 resolve 出去
        reader.onloadend = function() {
          resolve(fileResult);
        };
      });
    },
    base64ToFile(urlData, fileName) {
      let arr = urlData.split(",");
      let mime = arr[0].match(/:(.*?);/)[1];
      let bytes = atob(arr[1]); // 解码base64
      let n = bytes.length;
      let ia = new Uint8Array(n);
      while (n--) {
        ia[n] = bytes.charCodeAt(n);
      }
      return new File([ia], fileName, { type: mime });
    },
    dataURLtoFile(dataurl, filename = "file") {
      let arr = dataurl.split(",");
      let mime = arr[0].match(/:(.*?);/)[1];
      let suffix = mime.split("/")[1];
      let bstr = atob(arr[1]);
      let n = bstr.length;
      let u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], `${filename}.${suffix}`, {
        type: mime
      });
    }
  },
  created() {
    this.id && this.fetch();
  }
};
</script>
