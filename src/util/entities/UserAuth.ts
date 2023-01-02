import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { BaseClassWithoutId } from "./BaseClass";
import { User } from "./User";

@Entity()
export class UserAuth extends BaseClassWithoutId {
	@PrimaryGeneratedColumn()
	index: string;

	@Column({ nullable: true })
	totp_secret?: string;

	@Column({ nullable: true })
	totp_last_ticket?: string;

	@Column()
	valid_tokens_since: Date;

	@Column({ nullable: true })
	password?: string;

	@OneToOne(() => User, {
		cascade: true,
		orphanedRowAction: "delete",
	})
	user: User;
}