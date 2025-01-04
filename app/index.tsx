import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Image,
} from "react-native";

import XLSX from "xlsx";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import logo from "@/assets/icons/aaf-logo.png";
import csv from "@/assets/icons/csv.png";
import pdf from "@/assets/icons/pdf.png";
import refresh from "@/assets/icons/refresh.png";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

import Graph from "../components/Graph";
import Loader from "@/components/Loader";

const SensorGraph: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const ulimit = useRef<number>(50);
  const [sampleData, setSampleData] = useState<any[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);
  const [sensorAverages, setSensorAverages] = useState<Record<string, any>>({});

  const fetchPeriodicData = async () => {
    try {
      // const response = await fetch("http://localhost:5500/api/v1/sensor-data");
      setLoading(true);
      const response = await fetch(
        "https://transmonk-aaf.onrender.com/api/v1/sensor-data"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }
      const data = await response.json();
      setLoading(false);
      const averages = calculateSensorAverages(data);
      setSensorAverages(averages);
      setRawData(data);

      const formattedData1 = {
        title: "> 0.3 µm Particles",
        labels: [] as string[],
        unit: "pcs/l",
        label1: "Sensor 1",
        AVG1: averages["1"] ? parseInt(averages["1"]["pm0p3_1"]) : 0,
        AVG2: averages["2"] ? parseInt(averages["2"]["pm0p3_2"]) : 0,
        label3: "Sensor 2",
        line1: [] as number[],
        line2: [] as number[],
        line3: [] as number[],
      };

      const formattedData2 = {
        title: "> 0.5 µm Particles",
        labels: [] as string[],
        unit: "pcs/l",
        label1: "Sensor 1",
        AVG1: averages["1"] ? parseInt(averages["1"]["pm0p5_1"]) : 0,
        AVG2: averages["2"] ? parseInt(averages["2"]["pm0p5_2"]) : 0,
        label3: "Sensor 2",
        line1: [] as number[],
        line2: [] as number[],
        line3: [] as number[],
      };
      const formattedData3 = {
        title: "> 1.0 µm Particles",
        labels: [] as string[],
        unit: "pcs/l",
        label1: "Sensor 1",
        AVG1: averages["1"] ? parseInt(averages["1"]["pm1p0_1"]) : 0,
        AVG2: averages["2"] ? parseInt(averages["2"]["pm1p0_2"]) : 0,
        label3: "Sensor 2",
        line1: [] as number[],
        line2: [] as number[],
        line3: [] as number[],
      };

      const formattedData4 = {
        title: "> 2.5 µm Particles",
        labels: [] as string[],
        unit: "pcs/l",
        label1: "Sensor 1",
        AVG1: averages["1"] ? parseInt(averages["1"]["pm2p5_1"]) : 0,
        AVG2: averages["2"] ? parseInt(averages["2"]["pm2p5_2"]) : 0,
        label3: "Sensor 2",
        line1: [] as number[],
        line2: [] as number[],
        line3: [] as number[],
      };

      const formattedData5 = {
        title: "> 5.0 µm Particles",
        labels: [] as string[],
        unit: "pcs/l",
        label1: "Sensor 1",
        AVG1: averages["1"] ? parseInt(averages["1"]["pm5p0_1"]) : 0,
        AVG2: averages["2"] ? parseInt(averages["2"]["pm5p0_2"]) : 0,
        label3: "Sensor 2",
        line1: [] as number[],
        line2: [] as number[],
        line3: [] as number[],
      };

      const formattedData6 = {
        title: "> 10.0 µm Particles",
        labels: [] as string[],
        unit: "pcs/l",
        label1: "Sensor 1",
        AVG1: averages["1"] ? parseInt(averages["1"]["pm10p0_1"]) : 0,
        AVG2: averages["2"] ? parseInt(averages["2"]["pm10p0_2"]) : 0,
        label3: "Sensor 2",
        line1: [] as number[],
        line2: [] as number[],
        line3: [] as number[],
      };
      const formattedData7 = {
        title: "Differential Pressure",
        labels: [] as string[],
        unit: "Pa.",
        label1: "DP Sensor ",
        AVG1: averages["rawPressure"]
          ? parseInt(averages["rawPressure"]["rawPressure"])
          : 0,
        AVG2: sensorAverages["2"]
          ? parseInt(sensorAverages["2"]["pm0p3_2"])
          : 0,
        line1: [] as number[],
        line2: [] as number[],
        line3: [] as number[],
      };

      data.slice(0, ulimit.current).forEach((entry: any) => {
        const timestamp = new Date(entry?.createdAt);
        const ISTTime = timestamp.toLocaleTimeString("en-US", {
          timeZone: "Asia/Kolkata",
          hour12: true,
          hour: "2-digit",
          minute: "2-digit",
        });

        formattedData1.labels.push(ISTTime);
        formattedData1.line1.push(entry.pm0p3_1);

        formattedData1.line3.push(entry.pm0p3_2);

        formattedData2.labels.push(ISTTime);
        formattedData2.line1.push(entry.pm0p5_1);

        formattedData2.line3.push(entry.pm0p5_2);

        formattedData3.labels.push(ISTTime);
        formattedData3.line1.push(entry.pm1p0_1);

        formattedData3.line3.push(entry.pm1p0_2);

        formattedData4.labels.push(ISTTime);
        formattedData4.line1.push(entry.pm2p5_1);

        formattedData4.line3.push(entry.pm2p5_2);

        formattedData5.labels.push(ISTTime);
        formattedData5.line1.push(entry.pm5p0_1);

        formattedData5.line3.push(entry.pm5p0_2);

        formattedData6.labels.push(ISTTime);
        formattedData6.line1.push(entry.pm10p0_1);

        formattedData6.line3.push(entry.pm10p0_2);
        console.log("entry.pm10p0_2", entry.pm10p0_2);

        formattedData7.labels.push(ISTTime);
        formattedData7.line1.push(entry.rawPressure);
        console.log("line3rawPressure", entry.rawPressure);
      });

      setSampleData([
        formattedData1,
        formattedData2,
        formattedData3,
        formattedData4,
        formattedData5,
        formattedData6,
        formattedData7,
      ]);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching data:", error);
      setSampleData([]);
    }
  };

  useEffect(() => {
    fetchPeriodicData();
  }, []);

  const calculateSensorAverages = (data: any[]) => {
    const sensorSum: Record<string, any> = {};
    const sensorCounts: Record<string, any> = {};

    data.forEach((entry) => {
      for (const key in entry) {
        if (key.startsWith("pm") || key === "rawPressure") {
          const sensor = key.startsWith("pm")
            ? key.split("_")[1]
            : "rawPressure";
          if (!sensorSum[sensor]) {
            sensorSum[sensor] = {};
            sensorCounts[sensor] = {};
          }
          if (!sensorSum[sensor][key]) {
            sensorSum[sensor][key] = 0;
            sensorCounts[sensor][key] = 0;
          }
          sensorSum[sensor][key] += parseInt(entry[key]);
          sensorCounts[sensor][key]++;
        }
      }
    });

    const averages: Record<string, any> = {};
    for (const sensor in sensorSum) {
      averages[sensor] = {};
      for (const key in sensorSum[sensor]) {
        averages[sensor][key] =
          sensorSum[sensor][key] / sensorCounts[sensor][key];
      }
    }
    return averages;
  };

  const handleSaveCSV = async () => {
    try {
      const processedData = rawData.map((entry, index) => ({
        "Sr. No": index + 1,
        "Local Time": new Date(entry.createdAt).toLocaleString(),
        pm0p3_1: entry.pm0p3_1,
        pm0p5_1: entry.pm0p5_1,
        pm1p0_1: entry.pm1p0_1,
        pm2p5_1: entry.pm2p5_1,
        pm5p0_1: entry.pm5p0_1,
        pm10p0_1: entry.pm10p0_1,
        pm0p3_2: entry.pm0p3_2,
        pm0p5_2: entry.pm0p5_2,
        pm1p0_2: entry.pm1p0_2,
        pm2p5_2: entry.pm2p5_2,
        pm5p0_2: entry.pm5p0_2,
        pm10p0_2: entry.pm10p0_2,
        DP: entry.rawPressure,
      }));

      if (processedData.length === 0) {
        Alert.alert("No data to export");
        return;
      }

      const averageRow = {
        "Sr. No": "Average",
        "Local Time": "",
        pm0p3_1: Math.round(sensorAverages["1"].pm0p3_1),
        pm0p5_1: Math.round(sensorAverages["1"].pm0p5_1),
        pm1p0_1: Math.round(sensorAverages["1"].pm1p0_1),
        pm2p5_1: Math.round(sensorAverages["1"].pm2p5_1),
        pm5p0_1: Math.round(sensorAverages["1"].pm5p0_1),
        pm10p0_1: Math.round(sensorAverages["1"].pm10p0_1),
        pm0p3_2: Math.round(sensorAverages["2"].pm0p3_2),
        pm0p5_2: Math.round(sensorAverages["2"].pm0p5_2),
        pm1p0_2: Math.round(sensorAverages["2"].pm1p0_2),
        pm2p5_2: Math.round(sensorAverages["2"].pm2p5_2),
        pm5p0_2: Math.round(sensorAverages["2"].pm5p0_2),
        pm10p0_2: Math.round(sensorAverages["2"].pm10p0_2),
        DP: Math.round(sensorAverages.rawPressure.rawPressure),
      };

      const dataPayload = [averageRow, ...processedData];
      const ws = XLSX.utils.json_to_sheet(dataPayload);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

      const fileName = "Sensor_data.xlsx";
      const data = XLSX.write(wb, { type: "base64", bookType: "xlsx" });

      if (Platform.OS === "android") {
        // Use StorageAccessFramework to let the user choose location
        const permissions =
          await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

        if (permissions.granted) {
          const directoryUri = permissions.directoryUri;

          try {
            const newFileUri =
              await FileSystem.StorageAccessFramework.createFileAsync(
                directoryUri,
                fileName,
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              );

            await FileSystem.writeAsStringAsync(newFileUri, data, {
              encoding: FileSystem.EncodingType.Base64,
            });

            Alert.alert("Success", `File saved to the selected directory.`);
          } catch (error) {
            console.error("Error saving file:", error);
            Alert.alert(
              "Error",
              "Failed to save the file to the selected directory."
            );
          }
        } else {
          Alert.alert(
            "Permission Denied",
            "Storage permission is required to save the file."
          );
        }
      } else if (Platform.OS === "ios") {
        // For iOS or platforms where Sharing is available
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;
        await FileSystem.writeAsStringAsync(fileUri, data, {
          encoding: FileSystem.EncodingType.Base64,
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType:
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
        } else {
          Alert.alert("Success", `File saved to ${fileUri}`);
        }
      }
    } catch (error) {
      console.error("Error saving file:", error);
      Alert.alert("Error", "Failed to save the file.");
    }
  };

  const handleSavePDF = async () => {
    try {
      const doc = new jsPDF("landscape");

      // Title
      doc.setFontSize(16);
      doc.text("Sensor Data", 14, 20); // Add the title

      // Table headers
      const headers = [
        "Sr. No",
        "Local Time",
        "pm0p3_1",
        "pm0p5_1",
        "pm1p0_1",
        "pm2p5_1",
        "pm5p0_1",
        "pm10p0_1",
        "pm0p3_2",
        "pm0p5_2",
        "pm1p0_2",
        "pm2p5_2",
        "pm5p0_2",
        "pm10p0_2",
        "DP",
      ];

      // Map table data
      const tableData = rawData.map((entry, index) => [
        index + 1,
        new Date(entry.createdAt).toLocaleString(),
        entry.pm0p3_1,
        entry.pm0p5_1,
        entry.pm1p0_1,
        entry.pm2p5_1,
        entry.pm5p0_1,
        entry.pm10p0_1,
        entry.pm0p3_2,
        entry.pm0p5_2,
        entry.pm1p0_2,
        entry.pm2p5_2,
        entry.pm5p0_2,
        entry.pm10p0_2,
        entry.rawPressure,
      ]);

      // Add the average row
      const averageRow = [
        "Avg",
        "",
        Math.round(sensorAverages["1"].pm0p3_1),
        Math.round(sensorAverages["1"].pm0p5_1),
        Math.round(sensorAverages["1"].pm1p0_1),
        Math.round(sensorAverages["1"].pm2p5_1),
        Math.round(sensorAverages["1"].pm5p0_1),
        Math.round(sensorAverages["1"].pm10p0_1),
        Math.round(sensorAverages["2"].pm0p3_2),
        Math.round(sensorAverages["2"].pm0p5_2),
        Math.round(sensorAverages["2"].pm1p0_2),
        Math.round(sensorAverages["2"].pm2p5_2),
        Math.round(sensorAverages["2"].pm5p0_2),
        Math.round(sensorAverages["2"].pm10p0_2),
        Math.round(sensorAverages.rawPressure.rawPressure), // Round rawPressure average
      ];

      // Add first 12 rows to the first page, plus the average row
      autoTable(doc, {
        startY: 30,
        head: [headers],
        body: [averageRow, ...tableData.slice(0, 12)],
      });

      // Add remaining rows to the next pages
      autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 10, // Start just after the first table
        head: [headers],
        body: tableData.slice(12), // Remaining data
      });

      // Export the PDF as Base64 string
      const pdfOutput = doc.output("datauristring").split(",")[1];
      const fileName = "Sensor_Data.pdf";

      if (Platform.OS === "android") {
        const permissions =
          await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

        if (permissions.granted) {
          const directoryUri = permissions.directoryUri;

          try {
            const newFileUri =
              await FileSystem.StorageAccessFramework.createFileAsync(
                directoryUri,
                fileName,
                "application/pdf"
              );

            await FileSystem.writeAsStringAsync(newFileUri, pdfOutput, {
              encoding: FileSystem.EncodingType.Base64,
            });

            Alert.alert("Success", "PDF saved to the selected directory.");
          } catch (error) {
            console.error("Error saving PDF:", error);
            Alert.alert(
              "Error",
              "Failed to save the PDF to the selected directory."
            );
          }
        } else {
          Alert.alert(
            "Permission Denied",
            "Storage permission is required to save the file."
          );
        }
      } else if (Platform.OS === "ios") {
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;
        await FileSystem.writeAsStringAsync(fileUri, pdfOutput, {
          encoding: FileSystem.EncodingType.Base64,
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, { mimeType: "application/pdf" });
        } else {
          Alert.alert("Success", `PDF saved to ${fileUri}`);
        }
      }
    } catch (error) {
      console.error("Error saving PDF:", error);
      Alert.alert("Error", "Failed to save the PDF.");
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.nav}>
          <Image source={logo} style={styles.logo} />
          <Text style={styles.dataTextBold}>SENSOR INTEGRATION</Text>
        </View>
        <View style={styles.graphContainer}>
          {sampleData.map((data, index) => (
            <TouchableOpacity key={index}>
              <Graph
                key={index}
                data={data}
                id={`chart-${index}`}
                avg={sensorAverages}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <View style={styles.fixedBottomView}>
        <TouchableOpacity onPress={fetchPeriodicData}>
          <Image source={refresh} style={styles.logo} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSaveCSV}>
          <Image source={csv} style={styles.logo} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSavePDF}>
          <Image source={pdf} style={styles.logo} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  scrollViewContent: {
    paddingBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
    fontFamily: "Poppins_700Bold",
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    fontFamily: "Poppins_400Regular",
  },
  button: {
    fontFamily: "Poppins_500Medium",
  },
  dataText: {
    fontSize: 14,
    fontWeight: "400",
    fontFamily: "Poppins_400Regular",
  },
  nav: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  dataTextBold: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "Poppins_700Bold",
  },
  graphContainer: {
    marginBottom: 20,
  },
  fixedBottomView: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  logo: {
    height: 30,
    width: 100,
    objectFit: "contain",
  },
});

export default SensorGraph;
