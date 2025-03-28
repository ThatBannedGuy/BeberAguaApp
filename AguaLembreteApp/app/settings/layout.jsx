import { Tabs } from "expo-router";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { useState, useCallback } from "react";
import { ThemeProvider, useTheme } from "../utils/ThemeContext";

const hydrationMessages = [
    { title: "💧 Hidratação é Vida 💧", text: "Beber água melhora sua concentração e mantém seu cérebro afiado!" },
    { title: "💧 Água é Saúde 💧", text: "A hidratação adequada ajuda na digestão e regula seu corpo!" },
    { title:  "💧 Fique Hidratado 💧", text: "Água mantém sua pele saudável e radiante todos os dias!" },
    {title:  "💧 Vida em Movimento 💧", text: "Beber água regularmente dá energia para suas atividades!" },
    {title:  "💧 Equilíbrio Natural 💧", text: "A água regula sua temperatura corporal em qualquer clima!" }, 
];