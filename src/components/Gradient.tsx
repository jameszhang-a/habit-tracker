const Gradient = () => {
  return (
    <>
      <div className="absolute z-[-1] h-[100px] w-[150px] rounded-2xl bg-[#FE9378]"></div>
      <div
        style={{
          position: "absolute",
          height: "90%",
          width: "80%",
          left: "-20%",
          top: "-10%",
          background: "#9593D9",
          borderRadius: "50%",
          zIndex: -1,
          filter: "blur(15px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          height: "80%",
          width: "70%",
          top: "-12%",
          right: "-20%",
          background: "#fe9378",
          borderRadius: "50%",
          zIndex: -1,
          filter: "blur(15px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          height: "65%",
          width: "90%",
          bottom: "-15%",
          right: "-10%",
          background: "#FCF6BD",
          borderRadius: "50%",
          zIndex: -1,
          filter: "blur(15px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          height: "70%",
          width: "75%",
          bottom: "-10%",
          left: "-18%",
          background: "#D0F4DE",
          borderRadius: "50%",
          zIndex: -1,
          filter: "blur(15px)",
        }}
      />
      {/* <div
        style={{
          position: "absolute",
          height: "100%",
          width: "100%",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius: "1rem",
          zIndex: -1,
        }}
      /> */}
    </>
  );
};

export default Gradient;
