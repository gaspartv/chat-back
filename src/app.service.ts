import { Injectable } from '@nestjs/common';

@Injectable()
export class AppServices {
  async login() {}

  async create_user() {}

  async find_all_open_unattended_chats() {}

  async find_all_open_chats_im_part_of() {}

  async send_message() {}

  async open_chat() {}

  async find_one_chat() {}

  async answer_chat() {}

  async close_chat() {}
}
