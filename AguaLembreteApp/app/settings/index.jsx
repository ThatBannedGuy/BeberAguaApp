import React, { useState, useEffect, useCallback } from "react";
import { StyleSheet, View, Text, Switch, ActivityIndicator } from "react-native";
import { useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AguaContador from "../components/agua_contador";
import { setupNotifications, updateNotifications } from "../utils/notifications";
import { useTheme, themes } from "../utils/ThemeContext";
import Slider from "@react-native-community/slider";

const HISTORICO_AGUA = "waterHistory"; // Mesma chave usada no componente AguaContador
const SETTINGS_PATH = "beberagua:notificationSettings";
const INTERVAL_MIN = 0.01;
const INTERVAL_MAX = 4;
const INTERVAL_STEP = 0.01;

export default function HomeScreen() {
    const { theme } = useTheme();
    const [copos, setCopos] = useState(0);
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [interval, setInterval] = useState(null);
    const [isDarkMode, setIsDarkMode] = useState(theme === themes.dark);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const inicializa = async () => {
            await setupNotifications();
            await carregar();
            await updateNotifications();
        };
        inicializa();
    }, []);

    useFocusEffect(
        useCallback(() => {
            const recarregarAoVoltar = async () => {
                await carregar();
            };
            recarregarAoVoltar();
        }, [])
    );

    // Carregar histórico de consumo de água hoje e atualizar o contador
    const carregar = async () => {
        try {
            const historico_salvo = await AsyncStorage.getItem(HISTORICO_AGUA);
            const historico_parsed = historico_salvo ? JSON.parse(historico_salvo) : [];
            const dtAtual = new Date().toISOString().split("T")[0]; // Mantendo formato ISO para garantir compatibilidade
            const coposHoje = historico_parsed.find(entry => entry.date === dtAtual);
            setCopos(coposHoje ? coposHoje.count : 0);
        } catch (e) {
            console.error("Erro ao carregar contagem do dia:", e);
        }
    };

    const toggleTheme = (value) => {
        setIsDarkMode(value);
        setTheme(value ? "dark" : "light");
    };

    const loadSettings = async () => {
        try {
            const savedSettings = await AsyncStorage.getItem(SETTINGS_PATH);
            if (savedSettings) {
                const { enabled, interval: savedInterval, theme: savedTheme } = JSON.parse(savedSettings);
                setNotificationsEnabled(enabled);
                setInterval(parseFloat(savedInterval) || 1);
                setIsDarkMode(savedTheme === "dark");
                if (savedTheme) setTheme(savedTheme);
            } else {
                setInterval(1);
            }
        } catch (e) {
            console.error("Erro ao carregar configurações:", e);
            setInterval(1);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadSettings();
    }, []);

    useEffect(() => {
        if (!isLoading) {
            saveSettings();
        }
    }, [isDarkMode, notificationsEnabled, interval]);

    const saveSettings = async () => {
        try {
            const settings = {
                enabled: notificationsEnabled,
                interval: interval,
                theme: isDarkMode ? "dark" : "light",
            };
            await AsyncStorage.setItem(SETTINGS_PATH, JSON.stringify(settings));
            await updateNotifications();
        } catch (e) {
            console.error("Erro ao salvar configurações:", e);
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
            <AguaContador copos={copos} setCopos={setCopos} />
            <View style={[styles.card, { backgroundColor: theme.cardBackground }]}>
                <View style={styles.setting}>
                    <Text style={[styles.label, { color: theme.secondaryText }]}>
                        Modo Escuro
                    </Text>
                    <Switch
                        value={isDarkMode}
                        onValueChange={toggleTheme}
                        trackColor={{ false: "#ccc", true: theme.primary }}
                        thumbColor={isDarkMode ? theme.primaryDark : "#f4f3f4"}
                    />
                </View>
                <View style={styles.setting}>
                    <Text style={[styles.label, { color: theme.secondaryText }]}>
                        Notificações
                    </Text>
                    <Switch
                        value={notificationsEnabled}
                        onValueChange={setNotificationsEnabled}
                        trackColor={{ false: "#ccc", true: theme.primary }}
                        thumbColor={notificationsEnabled ? theme.primaryDark : "#f4f3f4"}
                    />
                </View>
                <View style={styles.sliderContainer}>
                    <Text style={[styles.label, { color: theme.secondaryText }]}>
                        Intervalo: {interval?.toFixed(2)} hora(s)
                    </Text>
                    <Slider
                        style={styles.slider}
                        minimumValue={INTERVAL_MIN}
                        maximumValue={INTERVAL_MAX}
                        step={INTERVAL_STEP}
                        value={interval}
                        onValueChange={setInterval}
                        minimumTrackTintColor={theme.primary}
                        maximumTrackTintColor={theme.secondaryText}
                        thumbTintColor={theme.primaryDark}
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
    },
    card: {
        borderRadius: 15,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    setting: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginVertical: 15,
    },
    label: {
        fontSize: 18,
        fontWeight: "500",
    },
    sliderContainer: {
        marginVertical: 15,
    },
    slider: {
        width: "100%",
        height: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        textAlign: "center",
        marginTop: 10,
        marginBottom: 20,
    },
});
