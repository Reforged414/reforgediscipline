package com.temp.plugin;

import com.getcapacitor.Logger;

public class Example {

    public String echo(String value) {
        Logger.info("Echo", value);
        return value;
    }
}
