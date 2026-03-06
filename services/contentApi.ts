//will be changed when the actual services r done
export const getAvailableContent = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return [
    {
      id: "fidel_tracing",
      title: "Fidel Tracing Pack",
      size: 12,
      downloadUrl: "mock://fidel"
    },
    {
      id: "animal_words",
      title: "Animal Word Pack",
      size: 8,
      downloadUrl: "mock://animals"
    },
    {
      id: "phonics_audio",
      title: "Phonics Audio Pack",
      size: 22,
      downloadUrl: "mock://phonics"
    },
    {
      id: "phonics_audiosdasd",
      title: "Phonics Audio Pack",
      size: 22,
      downloadUrl: "mock://phonics"
    }
  ];
};