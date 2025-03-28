import React from "react";
import { StyleSheet, View, Text, Button } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../utils/ThemeContext";

const HISTORICO_AGUA = "waterHistory";

export default function AguaContador({ copos, setCopos }) {
    const { theme } = useTheme();
    const dtAtual = new Date().toISOString().split("T")[0];

    const adicionar = async () => {
        try {
            const historico = await AsyncStorage.getItem(HISTORICO_AGUA);
            const lista = historico ? JSON.parse(historico) : [];
            const coposHoje = lista.find(entry => entry.date === dtAtual);

            if (coposHoje) {
                coposHoje.count += 1;
            } else {
                lista.push({ date: dtAtual, count: 1 });
            }

            await AsyncStorage.setItem(HISTORICO_AGUA, JSON.stringify(lista));
            setCopos(copos + 1); // Atualiza o estado local também
        } catch (e) {
            console.error("Erro ao salvar histórico", e);
        }
    };

    return (
        <View style={[styles.counterCard, { backgroundColor: theme.cardBackground }]}>
            <View style={styles.cardContent}>
                <Text style={[styles.counterText, { color: theme.primaryDark }]}>
                    Copos Hoje
                </Text>
                <Button title="Bebi um copo" onPress={adicionar} color={theme.primary} />
            </View>
            <View style={styles.cardFooter}>
                <Text style={styles.counter}>{copos} 💧</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    counterCard: {
        flexDirection: "row",
        padding: 20,
        alignItems: "center",
        justifyContent: "space-between",
    },
    cardContent: {
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
    },
    counter: {
        fontSize: 46,
        fontWeight: "bold",
    },
    counterText: {
        fontSize: 24,
        fontWeight: "600",
    },
    cardFooter: {
        marginTop: 10,
        alignItems: "center",
    },
});

