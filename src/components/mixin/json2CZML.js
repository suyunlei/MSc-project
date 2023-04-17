export default {
  methods: {
    json2CZML(e) {
      const file = e.target.files[0];
      if (!file) {
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result;
        const data = JSON.parse(content);
        console.log(data);
      };
      reader.readAsText(file);
    },
  },
};
