import { useState } from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

const Form2 = () => {
  const [formdata, setFormdata] = useState({
    phone: "",
  });

  const handleChnage = (name: string, value: string) => {
    // to update dynamically
    setFormdata((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = () => {
    console.log("form data succesfully Submitted");
    console.log(formdata);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Contact Form</Text>

      <Text style={styles.label}>Phone Number</Text>

      <TextInput
        placeholder="Enter Phone Number"
        value={formdata.phone}
        onChangeText={(text) => handleChnage("phone", text)}
        keyboardType="phone-pad"
        style={styles.input}
      />

      <Pressable style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </Pressable>
    </View>
  );
};

export default Form2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});