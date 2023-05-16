<script>
//配置
export default {
  tabs: [
    {
      title: "Home",
      name: "index",
      content: [
        {
          name: "loadNUS",
          label: "NUS Building",
        },
        // {
        //   name: "addCZML",
        //   label: "Thermal Comfort",
        // },
        // {
        //   name: "addGeoJSON",
        //   label: "addGeoJSON",
        // },
      ],
    },
    {
      title: "Thermal Comfort",
      name: "comfort",
      content: [
        {
          name: "selectData",
          label: "Select Participant",
        },
        {
          name: "addCZML",
          label: "Load Path",
        },
        {
          name: "addGeoJSON",
          label: "addGeoJSON",
        },
      ],
    },
    {
      title: "Weather Data",
      name: "weather",
      content: [
        {
          name: "loadWeatherData",
          label: "Load Weather Stations",
        },
      ],
    },
  ],
};
</script>
