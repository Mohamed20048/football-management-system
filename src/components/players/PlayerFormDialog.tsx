
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Player } from "@/types/football";

const playerSchema = z.object({
    full_name: z.string().min(2, "Name must be at least 2 characters"),
    position: z.enum(["GK", "DF", "MF", "FW"]),
    age: z.coerce.number().min(15).max(50),
    nationality: z.string().optional(),
    team_id: z.coerce.number().min(1, "Please select a team"),
    appearances: z.coerce.number().min(0).default(0),
    goals: z.coerce.number().min(0).default(0),
    assists: z.coerce.number().min(0).default(0),
    yellow_cards: z.coerce.number().min(0).default(0),
    red_cards: z.coerce.number().min(0).default(0),
});

type PlayerFormValues = z.infer<typeof playerSchema>;

interface PlayerFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    playerToEdit?: Player | null;
    onSuccess: () => void;
}

export function PlayerFormDialog({
    open,
    onOpenChange,
    playerToEdit,
    onSuccess,
}: PlayerFormDialogProps) {
    const { toast } = useToast();
    const [teams, setTeams] = useState<{ id: number; name: string }[]>([]);

    const form = useForm<PlayerFormValues>({
        resolver: zodResolver(playerSchema),
        defaultValues: {
            full_name: "",
            position: "MF",
            age: 20,
            nationality: "",
            team_id: 0,
            appearances: 0,
            goals: 0,
            assists: 0,
            yellow_cards: 0,
            red_cards: 0,
        },
    });

    useEffect(() => {
        const fetchTeams = async () => {
            const { data, error } = await supabase
                .from("teams")
                .select("id, name")
                .order("name");

            if (error) {
                toast({
                    title: "Error fetching teams",
                    description: "Could not load teams",
                    variant: "destructive",
                });
                return;
            }

            setTeams(data || []);
        };

        if (open) {
            fetchTeams();
        }
    }, [open, toast]);

    useEffect(() => {
        if (playerToEdit) {
            form.reset({
                full_name: playerToEdit.full_name,
                position: playerToEdit.position,
                age: playerToEdit.age,
                nationality: playerToEdit.nationality || "",
                team_id: playerToEdit.team_id,
                appearances: playerToEdit.appearances,
                goals: playerToEdit.goals,
                assists: playerToEdit.assists,
                yellow_cards: playerToEdit.yellow_cards,
                red_cards: playerToEdit.red_cards,
            });
        } else {
            form.reset({
                full_name: "",
                position: "MF",
                age: 20,
                nationality: "",
                team_id: 0,
                appearances: 0,
                goals: 0,
                assists: 0,
                yellow_cards: 0,
                red_cards: 0,
            });
        }
    }, [playerToEdit, open, form]);

    const onSubmit = async (values: PlayerFormValues) => {
        try {
            if (playerToEdit) {
                const { error } = await supabase
                    .from("players")
                    .update(values)
                    .eq("id", playerToEdit.id);

                if (error) throw error;
                toast({ title: "Player updated successfully" });
            } else {
                const { error } = await supabase
                    .from("players")
                    .insert(values);

                if (error) throw error;
                toast({ title: "Player added successfully" });
            }

            onSuccess();
            onOpenChange(false);
        } catch (error) {
            toast({
                title: "Error saving player",
                description: "Please try again later",
                variant: "destructive",
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>{playerToEdit ? "Edit Player" : "Add Player"}</DialogTitle>
                    <DialogDescription>
                        {playerToEdit
                            ? "Make changes to the player profile here."
                            : "Add a new player to the database."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="full_name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Full Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="John Doe" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="age"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Age</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="position"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Position</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select position" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="GK">Goalkeeper</SelectItem>
                                                <SelectItem value="DF">Defender</SelectItem>
                                                <SelectItem value="MF">Midfielder</SelectItem>
                                                <SelectItem value="FW">Forward</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="team_id"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Team</FormLabel>
                                    <Select
                                        onValueChange={(value) => field.onChange(Number(value))}
                                        value={field.value ? field.value.toString() : ""}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select team" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {teams.map((team) => (
                                                <SelectItem key={team.id} value={team.id.toString()}>
                                                    {team.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="nationality"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nationality</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Country" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-3 gap-2">
                            <FormField
                                control={form.control}
                                name="goals"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Goals</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="assists"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Assists</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="appearances"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Apps</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">Save Player</Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
