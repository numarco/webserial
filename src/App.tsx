import {serial} from "web-serial-polyfill";
import {useSerial} from "./Serial";
import {useEffect, useState} from "react";
import "./App.css";

const fromHexString = (hexString: string) =>
  new Uint8Array(hexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)));

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function App() {
  const value = useSerial();
  const [reader, setReader] = useState();
  const [out, appendOut] = useState("");

  const connect = async () => {
    const filters = [
      // Can identify the vendor and product IDs by plugging in the device and visiting: chrome://device-log/
      // the IDs will be labeled `vid` and `pid`, respectively
      {
        usbVendorId: 0x0403,
        usbProductId: 0x6001,
      },
    ];

    const port =
      "serial" in navigator
        ? await navigator.serial.requestPort({filters})
        : await serial.requestPort(
            {filters},
            {usbControlInterfaceClass: 255, usbTransferInterfaceClass: 255}
          );

    await port.open({baudRate: 9600});

    if (port?.writable && port?.readable) {
      const writer = port.writable.getWriter();

      console.info(writer, reader);
      const isWriterReady = await writer.ready;
      console.info(isWriterReady);

      const p = new Uint8Array([1, 3, 0, 0, 0, 10, 197, 205]);
      await writer.write(p);

      while (port.readable) {
        const reader = port.readable.getReader();

        try {
          const {done, value} = await reader.read();
          if (done) {
            break;
          }
          if (value) {
            const hex = Array.from(value)
              .map((b) => b.toString(16).padStart(2, "0"))
              .join(" ");
            appendOut((v) => v + hex);
            console.log(hex);
          }
        } catch (e) {
          console.error(e);
        } finally {
          reader.releaseLock();
        }
      }
    }
  };

  // useEffect(() => {
  //   console.info(value.canUseSerial);
  //   console.info("serial" in navigator);
  // }, [value]);

  return (
    <div className="App">
      <button onClick={() => connect()}>connect</button>
      <p>{out}</p>
    </div>
  );
}

export default App;
