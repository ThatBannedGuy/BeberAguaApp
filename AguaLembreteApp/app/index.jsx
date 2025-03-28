import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, View, Text, Switch, ActivityIndicator, TouchableOpacity } from "react-native";
import { useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AguaContador from "../components/agua_contador";
import { setupNotifications, updateNotifications } from "../utils/notifications";
import { useTheme, themes } from "../utils/ThemeContext";
import Slider from "@react-native-community/slider";

const HISTORICO_AGUA = "waterHistory";
const SETTINGS_PATH = "beberagua:notificationSettings";
const META_COPOS_PATH = "beberagua:metaCopos";
const INTERVAL_MIN = 0.01;
const INTERVAL_MAX = 4;
const INTERVAL_STEP = 0.01;

export default function HomeScreen() {
    const { theme } = useTheme();
    const [copos, setCopos] = useState(0);
    const [metaCopos, setMetaCopos] = useState(8);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [interval, setInterval] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(theme === themes.dark);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const inicializa = async () => {
            await setupNotifications();
            await carregar();
            await carregarMetaCopos();
            await updateNotifications();
        };
        inicializa();
    }, []);

    useFocusEffect(
        useCallback(() => {
            const recarregarAoVoltar = async () => {
                await carregar();
                await carregarMetaCopos();
            };
            recarregarAoVoltar();
        }, [])
    );

    const carregar = async () => {
        try {
            const historico_salvo = await AsyncStorage.getItem(HISTORICO_AGUA);
            const historico_parsed = historico_salvo ? JSON.parse(historico_salvo) : [];
            const dtAtual = new Date().toISOString().split("T")[0];
            const coposHoje = historico_parsed.find(entry => entry.date === dtAtual);
            setCopos(coposHoje ? coposHoje.count : 0);
        } catch (e) {
            console.error("Erro ao carregar contagem do dia:", e);
        }
    };

    const carregarMetaCopos = async () => {
        try {
            const metaSalva = await AsyncStorage.getItem(META_COPOS_PATH);
            if (metaSalva) {
                setMetaCopos(parseInt(metaSalva, 10));
            }
        } catch (e) {
            console.error("Erro ao carregar meta de copos:", e);
        }
    };

    const reiniciarDia = async () => {
        try {
            setCopos(0);
            const historico_salvo = await AsyncStorage.getItem(HISTORICO_AGUA);
            let historico_parsed = historico_salvo ? JSON.parse(historico_salvo) : [];
            const dtAtual = new Date().toISOString().split("T")[0];
            historico_parsed = historico_parsed.map(entry => entry.date === dtAtual ? { ...entry, count: 0 } : entry);
            await AsyncStorage.setItem(HISTORICO_AGUA, JSON.stringify(historico_parsed));
        } catch (e) {
            console.error("Erro ao reiniciar o contador do dia:", e);
        }
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}> 
            <Text style={[styles.title, { color: theme.primaryDark }]}> 
                Lembrete de Água 
            </Text>
            <AguaContador copos={copos} setCopos={setCopos} metaCopos={metaCopos} />
            <Text style={[styles.metaText, { color: theme.secondaryText }]}>Meta: {copos}/{metaCopos} copos</Text>
            <TouchableOpacity style={styles.resetButton} onPress={reiniciarDia}>
                <Text style={styles.resetButtonText}>Reiniciar Dia</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        textAlign: "center",
        marginTop: 10,
        marginBottom: 20,
    },
    metaText: {
        fontSize: 20,
        textAlign: "center",
        marginTop: 10,
        fontWeight: "600",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    resetButton: {
        backgroundColor: "#ff4d4d",
        padding: 10,
        borderRadius: 10,
        marginTop: 20,
        alignSelf: "center",
    },
    resetButtonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
});
