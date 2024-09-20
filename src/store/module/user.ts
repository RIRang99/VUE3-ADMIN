import { defineStore } from "pinia";

export const useUserStore = defineStore({
  id: "user",
  state: () => {
    return {
      name: "张三" as string | null,
      age: 18,
      gender: "男",
      token: null
    };
  },
  getters: {
    ageDouble: (state) => state.age * 2
  },
  actions: {
    ageAdd() {
      this.age++;
      console.log(this.age, "年龄");
    },
    updateName(name: string | null) {
      console.log(name);

      this.name = name;
      console.log(this.name, "姓名");
    }
  }
});
