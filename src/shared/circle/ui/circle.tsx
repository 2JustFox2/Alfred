export default function Circle(volume) {
  const radius = volume * 400 + 250;
  
  return (
    <>

      <div
        style={{
          width: `${radius}px`,
          height: `${radius}px`,
          backgroundColor: "#545454",
          borderRadius: "50%",
          top: "50%",
          left: "50%",
          position: "fixed",
          transform: "translate(-50%, -50%)",
          zIndex: "-1"
        }}
        ></div>
    </>
  );
}
