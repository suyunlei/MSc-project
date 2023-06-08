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
        {
          name: "clearAll",
          label: "Clear Entities",
        },
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

    {
      title: "Cozie Data",
      name: "cozie",
      content: [
        {
          name: "get_participant_menu",
          label: "Participant Menu",
        },
        {
          name: "load_participant_data",
          label: "Trace the Participant",
        },
      ],
    },
  ],
};
</script>
