import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  TouchableWithoutFeedback,
  Alert,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { captureRef } from "react-native-view-shot";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

interface GraphData {
  title: string;
  labels: string[];
  unit: string;
  label1: string;
  label3?: string;
  AVG1?: number;
  AVG2?: number;
  line1: string[];
  line3?: string[];
}

interface GraphProps {
  data: GraphData;
  id: string;
  avg: Record<string, any>;
}

const Graph: React.FC<GraphProps> = ({ data, id }) => {
  const [screenWidth, setScreenWidth] = useState(
    Dimensions.get("window").width
  );
  const [screenHeight, setScreenHeight] = useState(
    Dimensions.get("window").height
  );

  const graphRef = useRef(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onOrientationChange = () => {
      const { width, height } = Dimensions.get("window");
      setScreenWidth(width);
      setScreenHeight(height);
    };

    const subscription = Dimensions.addEventListener(
      "change",
      onOrientationChange
    );

    return () => {
      subscription?.remove();
    };
  }, []);

  const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    color: (opacity = 1) => `rgba(75, 192, 192, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
  };

  const limitedLabels = data?.labels || [];
  const limitedLine1 = data?.line1.map(Number) || [];
  const limitedLine3 = data?.line3?.map(Number) || [];

  const datasets = [];
  if (limitedLine1) {
    datasets.push({
      data: limitedLine1,
      color: (opacity = 1) => `rgba(200, 16, 46, ${opacity})`,
      strokeWidth: 2,
    });
  }
  if (limitedLine3) {
    datasets.push({
      data: limitedLine3,
      color: (opacity = 1) => `rgba(16, 46, 200, ${opacity})`,
      strokeWidth: 2,
    });
  }

  const chartData = {
    labels: limitedLabels,
    datasets,
    legend: [
      ...(limitedLine1.length > 0 ? [data.label1] : []),
      ...(limitedLine3.length > 0 && data.label3 ? [data.label3] : []),
    ],
  };

  const handleDataPointClick = (data: any) => {
    setHoverIndex(data.index);
    setPopupPosition({ x: data.x, y: data.y });
  };

  const handleClickOutside = () => {
    setHoverIndex(null);
  };

  const saveGraphAsImage = async () => {
    try {
      const uri = await captureRef(graphRef, {
        format: "png",
        quality: 0.8,
      });

      const fileName = `${id}.png`;
      const base64Data = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

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
                "image/png"
              );

            await FileSystem.writeAsStringAsync(newFileUri, base64Data, {
              encoding: FileSystem.EncodingType.Base64,
            });

            Alert.alert("Success", `Graph saved to the selected directory.`);
          } catch (error) {
            console.error("Error saving file:", error);
            Alert.alert(
              "Error",
              "Failed to save the graph to the selected directory."
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
        await FileSystem.writeAsStringAsync(fileUri, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, { mimeType: "image/png" });
        } else {
          Alert.alert("Success", `Graph saved to ${fileUri}`);
        }
      }
    } catch (error) {
      console.error("Error saving graph:", error);
      Alert.alert("Error", "Failed to save the graph.");
    }
  };

  useEffect(() => {
    if (!data.labels.length || (!limitedLine1 && !limitedLine3)) {
      console.warn(`Graph ${id} has insufficient data.`);
    }
  }, [data, id, limitedLine1, limitedLine3]);

  return (
    <View>
      <TouchableWithoutFeedback onPress={handleClickOutside}>
        <View style={styles.container} ref={graphRef}>
          <View style={styles.header}>
            <View style={styles.avgContainer}>
              {data.AVG1 !== undefined && (
                <Text style={styles.avgText}>
                  {data.label1} Avg:{" "}
                  <Text style={styles.avgValue}>
                    {data.AVG1} {data.unit}
                  </Text>
                </Text>
              )}
              {data.AVG2 !== undefined && data.label3 && (
                <Text style={styles.avgText}>
                  {data.label3} Avg:{" "}
                  <Text style={styles.avgValue}>
                    {data.AVG2} {data.unit}
                  </Text>
                </Text>
              )}
            </View>
          </View>
          {limitedLabels.length > 0 && datasets.length > 0 ? (
            <>
              <ScrollView horizontal>
                <LineChart
                  key={id}
                  data={chartData}
                  width={limitedLabels.length * 50} // Adjust based on the number of labels
                  height={screenHeight / 3} // Adjust based on orientation
                  chartConfig={chartConfig}
                  bezier
                  fromZero
                  withOuterLines={false}
                  style={styles.chart}
                  onDataPointClick={handleDataPointClick}
                />
              </ScrollView>
              {hoverIndex !== null && (
                <View
                  style={[
                    styles.popup,
                    { top: popupPosition.y, left: popupPosition.x },
                  ]}
                >
                  <Text
                    style={[
                      styles.popupText,
                      { color: "rgba(200, 16, 46, 1)" },
                    ]}
                  >
                    {data.label1} Value: {limitedLine1[hoverIndex]} {data.unit}
                  </Text>
                  {limitedLine3[hoverIndex] !== undefined && data.label3 && (
                    <Text
                      style={[
                        styles.popupText,
                        { color: "rgba(16, 46, 200, 1)" },
                      ]}
                    >
                      {data.label3} Value: {limitedLine3[hoverIndex]}{" "}
                      {data.unit}
                    </Text>
                  )}
                  <Text style={styles.popupText}>
                    Time: {limitedLabels[hoverIndex]}
                  </Text>
                </View>
              )}
            </>
          ) : (
            <Text style={styles.noDataText}>No data available to display.</Text>
          )}
        </View>
      </TouchableWithoutFeedback>
      <TouchableOpacity onPress={saveGraphAsImage}>
        <Text style={styles.saveBtn}>Save Graph as PNG</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingVertical: 10,
    paddingHorizontal: 2,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    marginVertical: 10,
  },
  saveBtn: {
    backgroundColor: "#D00000",
    color: "#fff",
    fontFamily: "Poppins_700Bold",
    textAlign: "center",
    paddingVertical: 4,
  },
  header: {
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  avgContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  avgText: {
    fontSize: 11,
    marginBottom: 5,
    color: "#000",
    fontFamily: "Poppins_600SemiBold",
  },
  avgValue: {
    color: "#C8102E",
    fontFamily: "Poppins_700Bold",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  popup: {
    position: "absolute",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
    zIndex: 100,
  },
  popupText: {
    fontSize: 11,
    marginBottom: 5,
    color: "#333",
    fontFamily: "Poppins_600SemiBold",
  },
  noDataText: {
    textAlign: "center",
    color: "#C8102E",
    marginTop: 20,
    fontFamily: "Poppins_600SemiBold",
  },
});

export default Graph;
