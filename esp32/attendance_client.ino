/*
  ESP32 RFID Attendance Client

  Sesuaikan:
  - WIFI_SSID
  - WIFI_PASSWORD
  - ATTENDANCE_URL pakai IP laptop/server, bukan localhost.

  Contoh:
  const char* ATTENDANCE_URL = "http://192.168.1.10:3001/api/attendance";
  const char* HEARTBEAT_URL = "http://192.168.1.10:3001/api/device/heartbeat";

  Hubungkan fungsi sendAttendance(...) ke event kartu RFID terbaca.
*/

#include <WiFi.h>
#include <HTTPClient.h>

const char* WIFI_SSID = "NAMA_WIFI";
const char* WIFI_PASSWORD = "PASSWORD_WIFI";

const char* DEVICE_ID = "ESP32-RFID-01";
const char* ATTENDANCE_URL = "http://192.168.1.10:3001/api/attendance";
const char* HEARTBEAT_URL = "http://192.168.1.10:3001/api/device/heartbeat";

unsigned long lastHeartbeat = 0;

void connectWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.print("Connecting WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.print("Connected. ESP32 IP: ");
  Serial.println(WiFi.localIP());
}

String jsonEscape(String value) {
  value.replace("\\", "\\\\");
  value.replace("\"", "\\\"");
  return value;
}

bool postJson(const char* url, String json) {
  if (WiFi.status() != WL_CONNECTED) {
    connectWiFi();
  }

  HTTPClient http;
  http.begin(url);
  http.addHeader("Content-Type", "application/json");

  int code = http.POST(json);
  String response = http.getString();

  Serial.print("POST ");
  Serial.print(url);
  Serial.print(" -> ");
  Serial.println(code);
  Serial.println(response);

  http.end();
  return code >= 200 && code < 300;
}

void sendHeartbeat() {
  String json = "{";
  json += "\"deviceId\":\"" + String(DEVICE_ID) + "\",";
  json += "\"name\":\"ESP32 RFID Reader\",";
  json += "\"firmware\":\"1.0.0\",";
  json += "\"ipAddress\":\"" + WiFi.localIP().toString() + "\"";
  json += "}";

  postJson(HEARTBEAT_URL, json);
}

void sendAttendance(String uid, String name, String status, String dateValue, String timeValue) {
  String json = "{";
  json += "\"uid\":\"" + jsonEscape(uid) + "\",";
  json += "\"name\":\"" + jsonEscape(name) + "\",";
  json += "\"status\":\"" + jsonEscape(status) + "\",";
  json += "\"date\":\"" + jsonEscape(dateValue) + "\",";
  json += "\"time\":\"" + jsonEscape(timeValue) + "\",";
  json += "\"deviceId\":\"" + String(DEVICE_ID) + "\"";
  json += "}";

  bool ok = postJson(ATTENDANCE_URL, json);
  if (!ok) {
    Serial.println("Gagal kirim. Simpan sementara lalu retry di project final.");
  }
}

void setup() {
  Serial.begin(115200);
  connectWiFi();
  sendHeartbeat();

  // Contoh test sekali saat boot. Hapus/comment jika RFID asli sudah dipasang.
  // Format tanggal/jam bisa diganti dari RTC DS3231.
  sendAttendance("TEST-CARD-001", "Tes Kartu RFID", "diterima", "2026-05-19", "08:12:05");
}

void loop() {
  if (millis() - lastHeartbeat > 30000) {
    lastHeartbeat = millis();
    sendHeartbeat();
  }

  // TODO:
  // 1. Baca UID dari RFID reader.
  // 2. Ambil tanggal dan jam dari RTC.
  // 3. Tentukan nama/status.
  // 4. Panggil sendAttendance(uid, name, status, date, time).
}
